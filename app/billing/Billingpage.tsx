"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Wallet,
  Check,
  CheckCircle2,
  Package,
  Store,
  X,
  Percent,
  ScanLine,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Camera,
} from "lucide-react";
import ReceiptView from "./Billprintpreview";
import type { ReceiptData } from "./Billprintpreview";
import BarcodeScannerModal from "@/app/components/BarcodeScannerModal";

import { useTheme } from "next-themes";

/* ------------------------------------------------------------------ */
/*  API endpoints — see views.py / urls.py                             */
/* ------------------------------------------------------------------ */

import { API_BASE } from "@/app/lib/api";
const PRODUCTS_URL = `${API_BASE}/billing/products/`;
const SALES_URL = `${API_BASE}/billing/sales/`;

const DISCOUNT_PRESETS = [0, 5, 10, 15];
const TAX_RATE = 0.05;

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface BillingProduct {
  id: string;
  name: string;
  category: string;
  unit: string;
  sellPrice: number;
  stock: number;
  barcode?: string;
}

interface CartItem {
  id: string;
  name: string;
  unit: string;
  price: number;
  qty: number;
  stock: number;
}

/* ------------------------------------------------------------------ */
/*  Design tokens — shared with Receipt.jsx                            */
/* ------------------------------------------------------------------ */

export const LIGHT_T = {
  bg: "#F4F5F7",
  surface: "#FFFFFF",
  surfaceAlt: "#FAFBFC",
  border: "#E3E6EA",
  borderStrong: "#CBD1D9",
  ink: "#12151A",
  inkSoft: "#5B6472",
  inkFaint: "#9AA3AF",
  accent: "#215CF6",
  accentDark: "#1A46C4",
  accentSoft: "#EAF0FF",
  good: "#0A9A5A",
  goodSoft: "#E7F8EF",
  warn: "#B3690B",
  warnSoft: "#FCF1E1",
  bad: "#D6392E",
  badSoft: "#FBEAE8",
};

export const DARK_T = {
  bg: "#090d16",
  surface: "#0f172a",
  surfaceAlt: "#1e293b",
  border: "#334155",
  borderStrong: "#475569",
  ink: "#f8fafc",
  inkSoft: "#cbd5e1",
  inkFaint: "#94a3b8",
  accent: "#3b82f6",
  accentDark: "#60a5fa",
  accentSoft: "#1e3a8a",
  good: "#10b981",
  goodSoft: "#064e3b",
  warn: "#fbbf24",
  warnSoft: "#451a03",
  bad: "#f43f5e",
  badSoft: "#881337",
};

export const T = LIGHT_T;

export function GlobalStyle({ themeTokens }: { themeTokens?: typeof LIGHT_T } = {}) {
  const t = themeTokens || LIGHT_T;
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .pos-ui { font-family: 'Inter', sans-serif; }
      .pos-num { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
      .pos-ui input::placeholder { color: ${t.inkFaint}; opacity: 1; }

      .pos-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
      .pos-scroll::-webkit-scrollbar-track { background: transparent; }
      .pos-scroll::-webkit-scrollbar-thumb { background: ${t.borderStrong}; border-radius: 8px; }

      .pos-focus:focus-visible {
        outline: 2.5px solid ${t.accent};
        outline-offset: 2px;
      }

      .prod-btn {
        transition: transform .1s ease, border-color .1s ease, box-shadow .1s ease, background-color .1s ease;
      }
      .prod-btn:not(:disabled):hover {
        border-color: ${t.accent};
        box-shadow: 0 4px 14px -6px rgba(33,92,246,0.35);
      }
      .prod-btn:not(:disabled):active { transform: scale(0.97); }

      .chip-btn { transition: background-color .1s ease, border-color .1s ease, color .1s ease; }

      .qty-btn { transition: background-color .1s ease, transform .1s ease; }
      .qty-btn:not(:disabled):active { transform: scale(0.9); }

      .cta-btn { transition: background-color .12s ease, transform .1s ease, box-shadow .12s ease; }
      .cta-btn:not(:disabled):hover { background-color: ${t.accentDark}; }
      .cta-btn:not(:disabled):active { transform: scale(0.985); }

      .clear-btn { transition: background-color .12s ease, border-color .12s ease, transform .1s ease; }
      .clear-btn:hover { background-color: ${t.bad}; color: #fff !important; border-color: ${t.bad} !important; }
      .clear-btn:active { transform: scale(0.97); }

      @keyframes modal-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes modal-pop {
        from { opacity: 0; transform: scale(0.95) translateY(8px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .modal-overlay { animation: modal-fade .15s ease-out both; }
      .modal-card { animation: modal-pop .18s cubic-bezier(.2,.8,.2,1) both; }

      @keyframes spin { to { transform: rotate(360deg); } }
      .spin { animation: spin 0.8s linear infinite; }

      @media (prefers-reduced-motion: reduce) {
        .prod-btn, .cta-btn, .qty-btn, .clear-btn, .modal-overlay, .modal-card, .spin { animation: none !important; transition: none !important; }
      }

      /* ---------------- Print: receipt only ---------------- */
      @media print {
        @page { size: 80mm auto; margin: 4mm; }
        body * { visibility: hidden; }
        .print-area, .print-area * { visibility: visible; }
        .print-area {
          position: absolute; left: 0; top: 0; width: 100%;
          box-shadow: none !important; border: none !important;
        }
        .no-print { display: none !important; }
      }
    `}</style>
  );
}

export function formatINR(n: number | string) {
  return `₹${(Number(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function BillingPage({
  storeName = "Sai General Store",
  storeTagline = "Grocery & Daily Essentials",
  storeAddress = "12, Main Road, Nagercoil - 629001",
  storePhone = "+91 98765 43210",
  cashierName = "Admin",
}) {
  const { resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");
  const T = isDark ? DARK_T : LIGHT_T;

  // Products now come from the real database via /api/products/ —
  // no more DEMO_PRODUCTS fallback.
  const [products, setProducts] = useState<BillingProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPct, setDiscountPct] = useState(0);
  const [payment, setPayment] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saleError, setSaleError] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanToast, setScanToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  /* ---------------- Load products from the database ---------------- */
  const loadProducts = async () => {
    setLoadingProducts(true);
    setLoadError(null);
    try {
      const res = await fetch(PRODUCTS_URL);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      setLoadError("Couldn't load products from the server. Check your connection and try again.");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase() === q ||
        (p.barcode && p.barcode.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [products, query, activeCategory]);

  const addToCart = (product: BillingProduct) => {
    if (!product || product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        { id: product.id, name: product.name, unit: product.unit, price: product.sellPrice, qty: 1, stock: product.stock },
      ];
    });
    setFlashId(product.id);
    window.setTimeout(() => setFlashId((cur) => (cur === product.id ? null : cur)), 220);
  };

  const setQty = (id: string, qty: number) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.min(i.stock, Math.max(1, Math.floor(qty) || 1)) } : i))
    );
  };
  const changeQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.min(i.stock, Math.max(1, i.qty + delta)) } : i))
    );
  };
  const removeItem = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm("Clear the entire bill? This can't be undone.")) {
      setCart([]);
      setDiscountPct(0);
      searchRef.current?.focus();
    }
  };

  /* ---------------- Barcode / keyboard workflow ---------------- */
  const handleBarcodeScanned = (barcodeStr: string) => {
    const code = barcodeStr.trim().toLowerCase();
    if (!code) return;

    // Search by exact barcode first, then id match or filtered match
    const barcodeMatch = products.find(
      (p) => p.barcode && p.barcode.trim().toLowerCase() === code
    );
    const idMatch = products.find(
      (p) => p.id.toLowerCase() === code || `prd${p.id}`.toLowerCase() === code
    );
    const target = barcodeMatch ?? idMatch ?? filtered[0];

    if (target) {
      if (target.stock <= 0) {
        setScanToast({ type: "error", msg: `"${target.name}" is Out of Stock! Cannot add to bill.` });
      } else {
        addToCart(target);
        setScanToast({ type: "success", msg: `Added "${target.name}" (₹${target.sellPrice}) to bill.` });
      }
    } else {
      setScanToast({ type: "error", msg: `No product found matching barcode "${barcodeStr}".` });
    }

    setTimeout(() => setScanToast(null), 4500);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!query.trim()) return;
      handleBarcodeScanned(query.trim());
      setQuery("");
    } else if (e.key === "Escape") {
      setQuery("");
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";

      if (e.key === "F2" || (e.key === "/" && !typing)) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if (e.key === "F9" && !showConfirm) {
        e.preventDefault();
        openConfirm();
      }
      if (e.key === "Escape" && showConfirm) {
        closeConfirm();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConfirm, cart, query, filtered]);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  /* ---------------- Totals (client-side preview only) ---------------- */
  /* The server recomputes all of this from real DB prices when the sale
     is submitted — these are just for what the cashier sees on screen. */
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discountAmt = discountPct ? (subtotal * Math.min(100, Math.max(0, Number(discountPct)))) / 100 : 0;
  const taxable = subtotal - discountAmt;
  const tax = taxable * TAX_RATE;
  const total = taxable + tax;
  const itemCount = cart.reduce((n, i) => n + i.qty, 0);

  const paidNum = payment === "cash" ? Number(amountPaid) || 0 : total;
  const balanceDue = payment === "cash" ? paidNum - total : 0;
  const cashShort = payment === "cash" && paidNum < total;

  const openConfirm = () => {
    if (cart.length === 0) {
      searchRef.current?.focus();
      return;
    }
    setSaleError(null);
    setAmountPaid((prev) => (prev ? prev : total.toFixed(2)));
    setShowConfirm(true);
  };
  const closeConfirm = () => {
    if (confirming) return;
    setShowConfirm(false);
  };

  /* ---------------- Finalize sale against the real database ---------------- */
  const finalizeSale = async () => {
    if (cart.length === 0) return;
    if (payment === "cash" && cashShort) return;

    setConfirming(true);
    setSaleError(null);
    try {
      const res = await fetch(SALES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({ id: i.id, qty: i.qty })),
          discountPct,
          payment,
          amountPaid: payment === "cash" ? paidNum : undefined,
          cashierName,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Couldn't complete the sale.");
      }


      // Cash or Card sale confirmed immediately
      setReceipt(data.receipt);
      setShowConfirm(false);
      loadProducts();
    } catch (err) {
      setSaleError(err instanceof Error ? err.message : "Something went wrong finalizing the sale.");
    } finally {
      setConfirming(false);
    }
  };


  const startNewSale = () => {
    setCart([]);
    setDiscountPct(0);
    setPayment("cash");
    setAmountPaid("");
    setReceipt(null);
    setQuery("");
    setActiveCategory("All");
    setSaleError(null);
    window.setTimeout(() => searchRef.current?.focus(), 0);
  };

  if (receipt) {
    return (
      <>
        <GlobalStyle />
        <ReceiptView
          receipt={receipt}
          storeName={storeName}
          storeTagline={storeTagline}
          storeAddress={storeAddress}
          storePhone={storePhone}
          onNewSale={startNewSale}
        />
      </>
    );
  }

  return (
    <div className="pos-ui min-h-screen" style={{ background: T.bg, color: T.ink }}>
      <GlobalStyle themeTokens={T} />

      <BarcodeScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleBarcodeScanned}
        title="Scan Barcode to Add Item to Bill"
      />

      {/* Header */}
      <header
        className="no-print sticky top-0 z-20 flex items-center justify-between gap-2.5 px-3.5 py-2.5 sm:px-6 sm:py-3"
        style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}
      >
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition active:scale-95"
            style={{ background: T.surfaceAlt, borderColor: T.border, color: T.ink }}
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg"
            style={{ background: T.accent, color: "#fff" }}
          >
            <Store className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold leading-tight sm:text-lg">{storeName}</h1>
            <p className="text-[11px] sm:text-xs" style={{ color: T.inkFaint }}>Billing counter</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <button
              onClick={() => {
                document.getElementById("cart-summary-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="lg:hidden flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white transition active:scale-95"
              style={{ background: T.accent }}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>{cart.length}</span>
            </button>
          )}

          <div
            className="flex items-center gap-2 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2"
            style={{ background: T.accentSoft }}
          >
            <span className="hidden text-xs font-semibold uppercase tracking-wide sm:inline" style={{ color: T.accentDark }}>
              Total
            </span>
            <span className="pos-num text-base font-bold sm:text-xl" style={{ color: T.accentDark }}>
              {formatINR(total)}
            </span>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 p-3 sm:p-4 lg:grid-cols-[1fr_400px] lg:gap-5 lg:p-5 w-full min-w-0">
        {/* Left: product picker */}
        <div className="flex flex-col rounded-2xl min-w-0" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="p-4" style={{ borderBottom: `1px solid ${T.border}` }}>
            {/* Scan Toast notification banner */}
            {scanToast && (
              <div
                className="mb-3 flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-xs"
                style={{
                  background: scanToast.type === "success" ? T.goodSoft : T.badSoft,
                  color: scanToast.type === "success" ? T.good : T.bad,
                  border: `1px solid ${scanToast.type === "success" ? T.good : T.bad}`,
                }}
              >
                <div className="flex items-center gap-2">
                  {scanToast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <span>{scanToast.msg}</span>
                </div>
                <button onClick={() => setScanToast(null)} className="hover:opacity-70">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5"
              style={{ background: T.surfaceAlt, border: `1.5px solid ${T.border}` }}
            >
              <ScanLine className="h-5 w-5 shrink-0" style={{ color: T.accent }} />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search or scan barcode… (Enter to add)"
                autoFocus
                disabled={loadingProducts}
                className="pos-focus w-full bg-transparent text-base outline-none"
                style={{ color: T.ink }}
              />
              {query && (
                <button onClick={() => { setQuery(""); searchRef.current?.focus(); }} aria-label="Clear search" style={{ color: T.inkFaint }}>
                  <X className="h-5 w-5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition shrink-0 hover:opacity-90"
                style={{ background: T.accentSoft, color: T.accentDark, border: `1px solid ${T.accent}` }}
                title="Open Camera Barcode Scanner"
              >
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Camera Scan</span>
              </button>
              <kbd
                className="hidden rounded-md px-1.5 py-0.5 text-[10px] font-semibold sm:inline"
                style={{ background: T.surface, border: `1px solid ${T.borderStrong}`, color: T.inkFaint }}
              >
                F2
              </kbd>
            </div>

            {/* Category chips */}
            <div className="pos-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="chip-btn shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold"
                    style={{
                      background: active ? T.accent : T.surfaceAlt,
                      color: active ? "#fff" : T.inkSoft,
                      border: `1px solid ${active ? T.accent : T.borderStrong}`,
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pos-scroll grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-4 content-start sm:grid-cols-3 sm:p-4 xl:grid-cols-4" style={{ maxHeight: "calc(100vh - 230px)" }}>
            {loadingProducts && (
              <div className="col-span-full flex flex-col items-center justify-center gap-2 py-16" style={{ color: T.inkFaint }}>
                <Loader2 className="h-8 w-8 spin" />
                <p className="text-sm">Loading products…</p>
              </div>
            )}

            {!loadingProducts && loadError && (
              <div className="col-span-full flex flex-col items-center justify-center gap-3 py-16" style={{ color: T.bad }}>
                <AlertTriangle className="h-8 w-8" />
                <p className="max-w-xs text-center text-sm">{loadError}</p>
                <button
                  onClick={loadProducts}
                  className="cta-btn pos-focus rounded-lg px-4 py-2 text-sm font-bold"
                  style={{ background: T.accent, color: "#fff" }}
                >
                  Retry
                </button>
              </div>
            )}

            {!loadingProducts && !loadError && filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center gap-2 py-16" style={{ color: T.inkFaint }}>
                <Package className="h-8 w-8" />
                <p className="text-sm">
                  {products.length === 0 ? "No products in the database yet." : `No products match "${query}".`}
                </p>
              </div>
            )}

            {!loadingProducts && !loadError && filtered.map((p) => {
              const inCart = cart.find((i) => i.id === p.id);
              const outOfStock = p.stock <= 0;
              const maxed = inCart && inCart.qty >= p.stock;
              const lowStock = p.stock > 0 && p.stock <= 5;
              const disabled = outOfStock || maxed;
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={disabled}
                  className="prod-btn pos-focus relative flex flex-col items-start rounded-xl p-3 text-left sm:p-3.5"
                  style={{
                    background: disabled ? T.surfaceAlt : flashId === p.id ? T.accentSoft : T.surface,
                    border: `1.5px solid ${flashId === p.id ? T.accent : T.border}`,
                    opacity: disabled ? 0.5 : 1,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                >
                  {inCart && (
                    <span
                      className="pos-num absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold"
                      style={{ background: T.accent, color: "#fff" }}
                    >
                      {inCart.qty}
                    </span>
                  )}
                  <span className="text-xs sm:text-sm font-semibold leading-snug w-full line-clamp-2" style={{ color: T.ink }}>
                    {p.name}
                  </span>
                  <span className="mt-1 text-[10px] sm:text-[11px] font-medium truncate w-full" style={{ color: T.inkFaint }}>
                    {p.category}
                  </span>
                  <div className="mt-2.5 sm:mt-3 flex w-full items-end justify-between gap-1">
                    <span className="pos-num text-sm sm:text-lg font-bold truncate" style={{ color: T.ink }}>
                      {formatINR(p.sellPrice)}
                    </span>
                    <span
                      className="text-[10px] sm:text-[11px] font-semibold shrink-0"
                      style={{ color: outOfStock ? T.bad : lowStock ? T.warn : T.inkFaint }}
                    >
                      {outOfStock ? "Out of stock" : `${p.stock} ${p.unit}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: cart / checkout */}
        <div
          id="cart-summary-section" className="flex h-fit flex-col rounded-2xl lg:sticky lg:top-[76px]"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
        >
          <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" style={{ color: T.accent }} />
              <h2 className="text-lg font-bold">Current bill</h2>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="clear-btn pos-focus flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-bold"
                style={{ background: T.badSoft, color: T.bad, border: `1.5px solid ${T.bad}` }}
              >
                <Trash2 className="h-4 w-4" />
                Clear all
              </button>
            )}
          </div>

          <div className="pos-scroll flex-1 overflow-y-auto p-4" style={{ maxHeight: 320 }}>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10" style={{ color: T.inkFaint }}>
                <ShoppingCart className="h-8 w-8" />
                <p className="text-sm text-center">Cart is empty.<br />Scan or tap a product to start.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((i) => (
                  <div
                    key={i.id}
                    className="flex items-center gap-3 rounded-xl p-2.5"
                    style={{ background: T.surfaceAlt }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold" style={{ color: T.ink }}>{i.name}</p>
                      <p className="pos-num text-xs" style={{ color: T.inkFaint }}>
                        {formatINR(i.price)} × {i.qty} = <span className="font-semibold" style={{ color: T.ink }}>{formatINR(i.price * i.qty)}</span>
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-0.5 rounded-lg p-1"
                      style={{ background: T.surface, border: `1px solid ${T.border}` }}
                    >
                      <button
                        onClick={() => changeQty(i.id, -1)}
                        aria-label="Decrease quantity"
                        className="qty-btn pos-focus flex h-8 w-8 items-center justify-center rounded-md"
                        style={{ color: T.inkSoft }}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        value={i.qty}
                        min={1}
                        max={i.stock}
                        onChange={(e) => setQty(i.id, Number(e.target.value))}
                        className="pos-num pos-focus w-9 rounded-md bg-transparent text-center text-sm font-bold outline-none"
                        style={{ color: T.ink }}
                      />
                      <button
                        onClick={() => changeQty(i.id, 1)}
                        disabled={i.qty >= i.stock}
                        aria-label="Increase quantity"
                        className="qty-btn pos-focus flex h-8 w-8 items-center justify-center rounded-md disabled:opacity-30"
                        style={{ color: T.inkSoft }}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(i.id)}
                      aria-label={`Remove ${i.name}`}
                      className="pos-focus flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                      style={{ color: T.inkFaint }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment + discount + totals */}
          <div className="space-y-4 p-4 sm:p-5" style={{ borderTop: `1px solid ${T.border}` }}>
            <div className="flex items-center justify-between p-3 rounded-xl border" style={{ background: T.surfaceAlt, borderColor: T.border }}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: T.accent }}>
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block" style={{ color: T.ink }}>Cash Payment</span>
                  <span className="text-[11px] text-slate-400">Cash-only counter settlement</span>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Cash Only
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: T.inkSoft }}>
                <Percent className="h-4 w-4" /> Discount
              </span>
              <div className="flex gap-1.5">
                {DISCOUNT_PRESETS.map((preset) => {
                  const active = Number(discountPct || 0) === preset;
                  return (
                    <button
                      key={preset}
                      onClick={() => setDiscountPct(preset)}
                      className="chip-btn pos-focus rounded-lg px-2.5 py-1.5 text-xs font-bold"
                      style={{
                        background: active ? T.accent : T.surfaceAlt,
                        color: active ? "#fff" : T.inkSoft,
                        border: `1px solid ${active ? T.accent : T.border}`,
                      }}
                    >
                      {preset}%
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pos-num space-y-1.5 pt-1 text-sm" style={{ borderTop: `1px dashed ${T.border}` }}>
              <div className="flex justify-between pt-3" style={{ color: T.inkSoft }}>
                <span>Subtotal</span><span>{formatINR(subtotal)}</span>
              </div>
              {discountAmt > 0 && (
                <div className="flex justify-between" style={{ color: T.good }}>
                  <span>Discount</span><span>-{formatINR(discountAmt)}</span>
                </div>
              )}
              <div className="flex justify-between" style={{ color: T.inkSoft }}>
                <span>Tax ({Math.round(TAX_RATE * 100)}%)</span><span>{formatINR(tax)}</span>
              </div>
              <div
                className="flex items-baseline justify-between pt-2 font-bold"
                style={{ borderTop: `1px solid ${T.border}`, color: T.ink }}
              >
                <span className="text-sm">Total ({itemCount} items)</span>
                <span className="text-2xl">{formatINR(total)}</span>
              </div>
            </div>

            <button
              onClick={openConfirm}
              disabled={cart.length === 0 || loadingProducts}
              className="cta-btn pos-focus flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold"
              style={{
                background: cart.length === 0 ? T.border : T.accent,
                color: cart.length === 0 ? T.inkFaint : "#fff",
                cursor: cart.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              Complete sale · {formatINR(total)}
              <kbd
                className="ml-1 hidden rounded-md px-1.5 py-0.5 text-[10px] font-semibold sm:inline"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                F9
              </kbd>
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmSaleModal
          itemCount={itemCount}
          subtotal={subtotal}
          discountAmt={discountAmt}
          tax={tax}
          total={total}
          payment={payment}
          amountPaid={amountPaid}
          setAmountPaid={setAmountPaid}
          balanceDue={balanceDue}
          cashShort={cashShort}
          confirming={confirming}
          saleError={saleError}
          onEdit={closeConfirm}
          onConfirm={finalizeSale}
        />
      )}


    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Confirm Sale modal                                                  */
/* ------------------------------------------------------------------ */

const PAYMENT_LABELS: Record<string, string> = { cash: "Cash", card: "Card", upi: "UPI" };

interface SummaryRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  valueColor?: string;
}

function SummaryRow({ label, value, valueColor }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[13px]" style={{ color: T.inkSoft }}>{label}</span>
      <span className="pos-num text-[13.5px] font-bold" style={{ color: valueColor ?? T.ink }}>{value}</span>
    </div>
  );
}

interface ConfirmSaleModalProps {
  itemCount: number;
  subtotal: number;
  discountAmt: number;
  tax: number;
  total: number;
  payment: string;
  amountPaid: string;
  setAmountPaid: (v: string) => void;
  balanceDue: number;
  cashShort: boolean;
  confirming: boolean;
  saleError: string | null;
  onEdit: () => void;
  onConfirm: () => void;
}

function ConfirmSaleModal({
  itemCount, subtotal, discountAmt, tax, total, payment,
  amountPaid, setAmountPaid, balanceDue, cashShort, confirming, saleError, onEdit, onConfirm,
}: ConfirmSaleModalProps) {
  return (
    <div
      className="no-print modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(18,21,26,0.55)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-sale-title"
      onClick={(e) => { if (e.target === e.currentTarget) onEdit(); }}
    >
      <div
        className="modal-card w-full max-w-[440px] max-h-[90vh] flex flex-col overflow-hidden rounded-3xl"
        style={{ background: T.surface, boxShadow: "0 24px 48px -16px rgba(18,21,26,0.35)" }}
      >
        {/* Header */}
        <div className="shrink-0 flex flex-col items-center px-6 pb-4 pt-6 text-center" style={{ background: "linear-gradient(to bottom, #F8FAFC, #FFFFFF)" }}>
          <div className="mb-2.5 flex h-12 w-12 items-center justify-center rounded-full shadow-sm" style={{ background: T.goodSoft, border: `3px solid white` }}>
            <CheckCircle2 className="h-6 w-6" style={{ color: T.good }} />
          </div>
          <h2 id="confirm-sale-title" className="text-lg font-extrabold tracking-tight">Confirm sale</h2>
          <p className="mt-1 max-w-[300px] text-xs font-medium" style={{ color: T.inkSoft }}>
            Review the bill details below. Inventory will be updated automatically.
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div className="rounded-xl px-4 py-3" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
            <div className="pt-0.5">
              <SummaryRow label="Items" value={itemCount} />
              <SummaryRow label="Subtotal" value={formatINR(subtotal)} />
              <SummaryRow label="Discount" value={discountAmt > 0 ? `-${formatINR(discountAmt)}` : formatINR(0)} valueColor={discountAmt > 0 ? T.good : T.ink} />
              <SummaryRow label={`GST (${Math.round(TAX_RATE * 100)}%)`} value={formatINR(tax)} />
              <SummaryRow label="Payment" value={PAYMENT_LABELS[payment] ?? payment} />
            </div>
            <div className="my-2 border-t border-dashed" style={{ borderColor: T.borderStrong }}></div>
            <div className="flex items-center justify-between rounded-lg px-1 py-1">
              <span className="text-[13px] font-bold" style={{ color: T.ink }}>Grand total</span>
              <span className="pos-num text-xl font-black" style={{ color: T.accentDark }}>{formatINR(total)}</span>
            </div>
          </div>

          {payment === "cash" && (
            <div className="mt-3 rounded-xl px-4 py-3" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider" style={{ color: T.inkSoft }}>
                Cash received
              </label>
              <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5" style={{ background: T.surface, border: `2px solid ${cashShort ? T.bad : T.accentSoft}`, transition: "border-color 0.2s" }}>
                <span className="pos-num text-base font-bold" style={{ color: T.inkFaint }}>₹</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="pos-num pos-focus w-full bg-transparent text-base font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ color: T.ink }}
                  autoFocus
                />
              </div>
              {cashShort ? (
                <p className="mt-1.5 text-xs font-semibold" style={{ color: T.bad }}>
                  Short by {formatINR(total - (Number(amountPaid) || 0))}
                </p>
              ) : (
                <div className="mt-2 flex items-center justify-between rounded-lg px-3 py-1.5" style={{ background: T.goodSoft }}>
                  <span className="text-xs font-bold" style={{ color: T.good }}>Balance to return</span>
                  <span className="pos-num text-base font-black" style={{ color: T.good }}>{formatINR(balanceDue)}</span>
                </div>
              )}
            </div>
          )}



          {saleError && (
            <div
              className="mt-2.5 flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold"
              style={{ background: T.badSoft, color: T.bad, border: `1px solid ${T.bad}` }}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{saleError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onEdit}
            disabled={confirming}
            className="cta-btn pos-focus flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold disabled:opacity-50"
            style={{ background: T.surfaceAlt, color: T.inkSoft, border: `1.5px solid ${T.border}` }}
          >
            <ArrowLeft className="h-4 w-4" /> Edit
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming || cashShort}
            className="cta-btn pos-focus flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold disabled:opacity-70"
            style={{ background: T.good, color: "#fff" }}
          >
            {confirming ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40" style={{ borderTopColor: "#fff" }} />
                Saving…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Confirm Sale
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
