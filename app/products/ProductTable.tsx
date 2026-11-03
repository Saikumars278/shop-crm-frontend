"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiBox,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiPackage,
  FiAlertTriangle,
  FiXCircle,
  FiLoader,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import EditProductModal from "./modals/EditProductModal";
import ViewProductModal from "./modals/ViewProductModal";
import DeleteProductModal from "./modals/DeleteModal";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
// Point this at your Django server. Adjust the base URL as needed
// (e.g. via NEXT_PUBLIC_API_URL in your .env.local file).
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

// How many rows to show per page.
const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type Product = {
  id: string;
  name: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  unit?: string;
  expiry_date?: string | null;
  barcode?: string | null;
};

// Shape returned by your Django serializer (fields = "__all__").
// ASSUMPTION: your Product model uses these field names. If your model's
// field names differ (e.g. you used `category` instead of `company`, or
// camelCase), just adjust the two mapping functions below — nothing else
// in the component needs to change.
type ApiProduct = {
  id: number | string;
  name: string;
  company?: string;
  category?: string;
  buy_price?: number | string;
  sell_price?: number | string;
  buyPrice?: number | string;
  sellPrice?: number | string;
  stock: number | string;
  status?: Product["status"];
  unit?: string;
  expiry_date?: string | null;
  barcode?: string | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function computeStatus(stock: number): Product["status"] {
  if (stock <= 0) return "Out of Stock";
  if (stock < 10) return "Low Stock";
  return "In Stock";
}

function apiToProduct(raw: ApiProduct): Product {
  const stock = Number(raw.stock ?? 0);
  return {
    id: String(raw.id),
    name: raw.name ?? "",
    category: raw.category ?? raw.company ?? "",
    buyPrice: Number(raw.buy_price ?? raw.buyPrice ?? 0),
    sellPrice: Number(raw.sell_price ?? raw.sellPrice ?? 0),
    stock,
    status: raw.status ?? computeStatus(stock),
    unit: raw.unit ?? "pcs",
    expiry_date: raw.expiry_date ?? null,
    barcode: raw.barcode ?? null,
  };
}

// Reverse mapping used when sending data back to Django (POST / PUT).
function productToApi(product: Omit<Product, "id"> | Product) {
  return {
    name: product.name,
    category: product.category,
    buy_price: product.buyPrice,
    sell_price: product.sellPrice,
    stock: product.stock,
    unit: product.unit ?? "pcs",
    expiry_date: product.expiry_date ?? null,
    barcode: product.barcode ?? null,
  };
}

function statusClasses(status: Product["status"]) {
  switch (status) {
    case "In Stock":
      return "bg-green-100 text-green-700";
    case "Low Stock":
      return "bg-yellow-100 text-yellow-700";
    case "Out of Stock":
      return "bg-red-100 text-red-700";
  }
}

async function parseErrorMessage(res: Response) {
  try {
    const data = await res.json();
    if (typeof data === "string") return data;
    if (data?.error) return data.error;
    // DRF validation errors: { field: ["msg"] }
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const val = data[firstKey];
      return `${firstKey}: ${Array.isArray(val) ? val[0] : val}`;
    }
  } catch {
    // ignore json parse errors
  }
  return `Request failed with status ${res.status}`;
}

// ---------------------------------------------------------------------------
// Expiry Check Helper
// ---------------------------------------------------------------------------
function getExpiryInfo(dateStr?: string | null) {
  if (!dateStr) return { state: "Fresh", label: "No Expiry", color: "bg-slate-100 text-slate-600" };
  const expiry = new Date(dateStr);
  if (isNaN(expiry.getTime())) return { state: "Fresh", label: "Invalid Date", color: "bg-slate-100 text-slate-600" };
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Normalize to start of day
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { state: "Expired", label: `${Math.abs(diffDays)} days ago`, color: "bg-red-100 text-red-700", days: diffDays };
  if (diffDays === 0) return { state: "Expiring Soon", label: "Expires today", color: "bg-orange-100 text-orange-700", days: diffDays };
  if (diffDays <= 10) return { state: "Expiring Soon", label: `in ${diffDays} day${diffDays !== 1 ? "s" : ""}`, color: "bg-orange-100 text-orange-700", days: diffDays };
  return { state: "Fresh", label: `${diffDays} days left`, color: "bg-green-100 text-green-700", days: diffDays };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selected, setSelected] = useState<Product | null>(null);

  // Pagination: 1-indexed current page.
  const [currentPage, setCurrentPage] = useState(1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -------------------------------------------------------------------
  // Fetch products (GET /products/?search=)
  // -------------------------------------------------------------------
  const fetchProducts = useCallback(async (search: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${API_BASE}/products/`);
      if (search.trim()) url.searchParams.set("search", search.trim());

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(await parseErrorMessage(res));

      const data: ApiProduct[] = await res.json();
      setProducts(data.map(apiToProduct));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts("");
  }, [fetchProducts]);

  // Debounced search-as-you-type against the backend
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProducts(query);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Reset back to page 1 whenever the search query changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  // -------------------------------------------------------------------
  // Create (POST /products/)
  // -------------------------------------------------------------------
  const addProduct = async (product: Omit<Product, "id">) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/products/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productToApi(product)),
      });
      if (!res.ok) throw new Error(await parseErrorMessage(res));

    const created: ApiProduct = await res.json();

setProducts((prev) => [apiToProduct(created), ...prev]);

// Refresh from Django
await fetchProducts(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add product");
    }
  };

  // -------------------------------------------------------------------
  // Update (PUT /products/:id/)
  // -------------------------------------------------------------------
  const updateProduct = async (updated: Product) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/products/${updated.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productToApi(updated)),
      });
      if (!res.ok) throw new Error(await parseErrorMessage(res));

      const saved: ApiProduct = await res.json();
      const mapped = apiToProduct(saved);
      setProducts((prev) =>
        prev.map((p) => (p.id === mapped.id ? mapped : p))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update product"
      );
    } finally {
      setSelected(null);
      setShowEdit(false);
    }
  };

  // -------------------------------------------------------------------
  // Delete (DELETE /products/:id/)
  // -------------------------------------------------------------------
  const deleteProduct = async () => {
    if (!selected) return;
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/products/${selected.id}/`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204)
        throw new Error(await parseErrorMessage(res));

      setProducts((prev) => prev.filter((p) => p.id !== selected.id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete product"
      );
    } finally {
      setSelected(null);
      setShowDelete(false);
    }
  };

  // Server already filters by `search`, but keep a light client-side
  // fallback so the UI stays responsive between keystrokes/debounce.
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, query]);

  // -------------------------------------------------------------------
  // Pagination derived values
  // -------------------------------------------------------------------
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE)
  );

  // Keep currentPage in range if the filtered list shrinks (e.g. after
  // a delete or a search that returns fewer results/pages).
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const pageStart =
    filteredProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, filteredProducts.length);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  // Build a compact list of page numbers with ellipses for large sets.
  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    const maxButtons = 5;

    if (totalPages <= maxButtons + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);

    if (left > 2) pages.push("ellipsis");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("ellipsis");

    pages.push(totalPages);
    return pages;
  }, [totalPages, currentPage]);

  const stats = useMemo(() => {
    const total = products.length;
    const lowStock = products.filter((p) => p.status === "Low Stock").length;
    const outOfStock = products.filter(
      (p) => p.status === "Out of Stock"
    ).length;
    const inventoryValue = products.reduce(
      (sum, p) => sum + p.buyPrice * p.stock,
      0
    );
    let expired = 0;
    let expiringSoon = 0;
    products.forEach((p) => {
      const info = getExpiryInfo(p.expiry_date);
      if (info.state === "Expired") expired++;
      else if (info.state === "Expiring Soon") expiringSoon++;
    });
    return { total, lowStock, outOfStock, inventoryValue, expired, expiringSoon };
  }, [products]);

  const handleExport = () => {
    const header = [
      "ID",
      "Name",
      "Category",
      "Buy Price",
      "Sell Price",
      "Stock",
      "Status",
    ];
    const rows = products.map((p) => [
      p.id,
      p.name,
      p.category,
      p.buyPrice,
      p.sellPrice,
      p.stock,
      p.status,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grocery_inventory.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4">
      <div className="space-y-4">
        {/* Header (owns the Add Product button + modal) */}

        {/* Error banner */}
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stat cards - Responsive 2-column mobile grid, 5-col desktop */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-5 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-xs transition-all hover:shadow-md">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FiPackage size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                Total Products
              </p>
              <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
                {stats.total}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-xs transition-all hover:shadow-md">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-950/60 text-yellow-600 dark:text-yellow-400">
              <FiAlertTriangle size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                Low Stock
              </p>
              <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
                {stats.lowStock}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-xs transition-all hover:shadow-md">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <FiXCircle size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                Out of Stock
              </p>
              <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
                {stats.outOfStock}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-xs transition-all hover:shadow-md">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400">
              <FiBox size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                Inventory Value
              </p>
              <p className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
                ₹{stats.inventoryValue.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-2 lg:col-span-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-xs transition-all hover:shadow-md">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              <FiAlertTriangle size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                Expiry Alerts
              </p>
              <div className="mt-0.5 flex items-baseline gap-1.5 flex-wrap">
                <span className="text-base sm:text-lg font-bold text-red-600 leading-none">{stats.expired}</span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Expired</span>
                <span className="ml-1 text-base sm:text-lg font-bold text-orange-500 leading-none">{stats.expiringSoon}</span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                Grocery Inventory
              </h2>
              <p className="text-[11px] text-slate-400">
                {loading
                  ? "Loading..."
                  : filteredProducts.length > 0
                  ? `Showing ${pageStart}-${pageEnd} of ${filteredProducts.length} items`
                  : `0 of ${products.length} items shown`}
              </p>
            </div>

            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, category, barcode..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-9 pr-3 text-xs text-slate-700 dark:text-slate-200 outline-none transition focus:border-blue-400 focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-100 sm:w-64"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <FiLoader className="animate-spin text-2xl text-slate-400" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="crm-table-container">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-100 dark:border-slate-800">
                      <th className="whitespace-nowrap px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Product
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Category
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Unit
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Buy Price
                      </th>
                      <th className="whitespace-nowrap p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Sell Price
                      </th>
                      <th className="whitespace-nowrap p-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Stock
                      </th>
                      <th className="whitespace-nowrap p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Expiry
                      </th>
                      <th className="whitespace-nowrap p-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Status
                      </th>
                      <th className="whitespace-nowrap p-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="transition hover:bg-slate-50 dark:bg-slate-800"
                      >
                        {/* Product */}
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2.5">
                            <div className="shrink-0 rounded-lg bg-blue-100 p-2">
                              <FiBox className="text-base text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-[12px] font-semibold text-slate-800 dark:text-white leading-tight">
                                {product.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                                {product.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="whitespace-nowrap px-4 py-2 text-left text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {product.category}
                        </td>

                        {/* Unit */}
                        <td className="whitespace-nowrap px-4 py-2 text-center">
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                            {product.unit ?? "pcs"}
                          </span>
                        </td>

                        {/* Buy */}
                        <td className="whitespace-nowrap px-4 py-2 text-right text-[11px] font-medium tabular-nums text-slate-700 dark:text-slate-200">
                          ₹{product.buyPrice.toLocaleString("en-IN")}
                        </td>

                        {/* Sell */}
                        <td className="whitespace-nowrap px-4 py-2 text-right text-[11px] font-semibold tabular-nums text-green-600">
                          ₹{product.sellPrice.toLocaleString("en-IN")}
                        </td>

                        {/* Stock */}
                        <td className="whitespace-nowrap px-4 py-2 text-center text-[12px] font-bold tabular-nums text-slate-800 dark:text-white">
                          {product.stock}
                        </td>

                        {/* Expiry */}
                        <td className="whitespace-nowrap px-4 py-2 text-left">
                          {(() => {
                            if (!product.expiry_date) return <span className="text-slate-400">—</span>;
                            const info = getExpiryInfo(product.expiry_date);
                            return (
                              <div className="flex flex-col gap-0 items-start">
                                <span className="text-slate-800 dark:text-white font-semibold text-[11px]">
                                  {product.expiry_date}
                                </span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className={`inline-block rounded px-1 py-0 text-[9px] uppercase tracking-wider font-bold ${info.color}`}>
                                    {info.state}
                                  </span>
                                  <span className="text-slate-400 text-[9px] font-medium">
                                    • {info.label}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </td>

                        {/* Status */}
                        <td className="whitespace-nowrap px-4 py-2 text-center">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusClasses(
                              product.status
                            )}`}
                          >
                            {product.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="whitespace-nowrap px-4 py-2">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelected(product);
                                setShowView(true);
                              }}
                              aria-label={`View ${product.name}`}
                              className="rounded-lg bg-blue-50 p-1.5 text-blue-600 transition hover:bg-blue-100"
                            >
                              <FiEye size={14} />
                            </button>

                            <button
                              onClick={() => {
                                setSelected(product);
                                setShowEdit(true);
                              }}
                              aria-label={`Edit ${product.name}`}
                              className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 transition hover:bg-emerald-100"
                            >
                              <FiEdit2 size={14} />
                            </button>

                            <button
                              onClick={() => {
                                setSelected(product);
                                setShowDelete(true);
                              }}
                              aria-label={`Delete ${product.name}`}
                              className="rounded-lg bg-rose-50 p-1.5 text-rose-600 transition hover:bg-rose-100"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 px-4 py-3 sm:flex-row">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Showing{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{pageStart}</span> to{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{pageEnd}</span> of{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredProducts.length}</span> Results
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition hover:bg-slate-50 dark:bg-slate-800 disabled:opacity-50"
                    >
                      <FiChevronLeft size={14} />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {pageNumbers.map((pageNum: number | string, idx: number) => {
                        if (pageNum === "ellipsis") {
                          return (
                            <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">
                              ...
                            </span>
                          );
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum as number)}
                            className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-medium transition ${
                              currentPage === pageNum
                                ? "bg-blue-600 text-white"
                                : "bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition hover:bg-slate-50 dark:bg-slate-800 disabled:opacity-50"
                    >
                      <FiChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="rounded-full bg-slate-100 p-4">
                <FiSearch className="text-2xl text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                No grocery items found
              </h3>
              <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Try a different search term, or add a new grocery item to your
                inventory.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Product Modal */}
      <EditProductModal
        open={showEdit}
        product={selected}
        onClose={() => {
          setSelected(null);
          setShowEdit(false);
        }}
        onUpdate={updateProduct}
      />

      {/* View Product Modal */}
      <ViewProductModal
        open={showView}
        product={selected}
        onClose={() => {
          setSelected(null);
          setShowView(false);
        }}
      />

      {/* Delete Product Modal */}
      <DeleteProductModal
        open={showDelete}
        product={selected}
        onClose={() => {
          setSelected(null);
          setShowDelete(false);
        }}
        onDelete={deleteProduct}
      />
    </div>
  );
}