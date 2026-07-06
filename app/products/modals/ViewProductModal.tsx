"use client";

import {
  X,
  Package,
  Tag,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart2,
  ScanBarcode,
  ListPlus,
} from "lucide-react";

/**
 * type Product = {
 *   id: string;
 *   name: string;
 *   category: string;
 *   buyPrice: number;
 *   sellPrice: number;
 *   stock: number;
 *   unit?: string;
 *   expiryDate?: string | null;
 *   barcode?: string | null;
 *   status: "In Stock" | "Low Stock" | "Out of Stock";
 *   customFields?: { key: string; value: string }[];
 * };
 */

function statusClasses(status: string) {
  if (status === "In Stock") return "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200";
  if (status === "Low Stock") return "bg-amber-50 text-amber-600 ring-1 ring-amber-200";
  return "bg-rose-50 text-rose-600 ring-1 ring-rose-200";
}

function statusDot(status: string) {
  if (status === "In Stock") return "bg-emerald-500";
  if (status === "Low Stock") return "bg-amber-500";
  return "bg-rose-500";
}

function isExpiringSoon(expiry: string | null | undefined): boolean {
  if (!expiry) return false;
  const diff = (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff <= 30 && diff >= 0;
}

function isExpired(expiry: string | null | undefined): boolean {
  if (!expiry) return false;
  return new Date(expiry).getTime() < Date.now();
}

interface ViewProductModalProps {
  open: boolean;
  product: import("../ProductTable").Product | null;
  onClose: () => void;
}

export default function ViewProductModal({ open, product, onClose }: ViewProductModalProps) {
  if (!open || !product) return null;

  const stockPct = Math.min(100, (product.stock / 60) * 100);
  const expired = isExpired(product.expiry_date);
  const expiringSoon = !expired && isExpiringSoon(product.expiry_date);
  const margin =
    product.buyPrice > 0
      ? (((product.sellPrice - product.buyPrice) / product.buyPrice) * 100).toFixed(1)
      : null;
  const customFields = (product as any).customFields ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-black/5">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-7 pb-8 pt-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-indigo-500/10 blur-2xl" />

          <div className="relative flex items-start justify-between">
            <span className="rounded-full bg-white dark:bg-slate-900/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/70 ring-1 ring-white/10">
              Grocery item details
            </span>

            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-full bg-white/10 p-2 text-white/70 backdrop-blur transition hover:bg-white dark:bg-slate-900/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative mt-5 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-900/10 ring-1 ring-white/15">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-xl font-bold text-white">{product.name}</h3>
              <p className="text-sm font-medium text-white/50">{product.id}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-7 py-6">
          {/* Status + Category + Unit badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses(product.status)}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusDot(product.status)}`} />
              {product.status}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
              {product.category}
            </span>

            {product.unit && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                {product.unit}
              </span>
            )}
          </div>

          {/* Price comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <TrendingDown className="h-3.5 w-3.5" />
                Buy price
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
                ₹{product.buyPrice.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-500">
                <TrendingUp className="h-3.5 w-3.5" />
                Sell price
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                ₹{product.sellPrice.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {margin !== null && (
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 px-4 py-3">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Margin</span>
              <span className={`text-sm font-bold ${Number(margin) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {margin}%
              </span>
            </div>
          )}

          {/* Stock */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Stock level</span>
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                {product.stock} {product.unit ?? "units"}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${
                  product.status === "In Stock"
                    ? "bg-emerald-500"
                    : product.status === "Low Stock"
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${stockPct}%` }}
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              Expiry date
            </div>
            {product.expiry_date ? (
              <div
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                  expired
                    ? "bg-red-50 text-red-600"
                    : expiringSoon
                    ? "bg-orange-50 text-orange-600"
                    : "bg-green-50 text-green-700"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {product.expiry_date}
                {expired && <span className="ml-1 text-xs font-bold">(Expired)</span>}
                {expiringSoon && <span className="ml-1 text-xs font-bold">(Expiring soon)</span>}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Non-perishable item</p>
            )}
          </div>

          {/* Barcode */}
          {product.barcode && (
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <ScanBarcode className="h-3.5 w-3.5" />
                Barcode
              </div>
              <p className="font-mono text-sm font-semibold tracking-widest text-slate-700 dark:text-slate-200">
                {product.barcode}
              </p>
            </div>
          )}

          {/* Custom fields */}
          {customFields.length > 0 && (
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <ListPlus className="h-3.5 w-3.5" />
                Additional details
              </div>
              <dl className="divide-y divide-slate-100 dark:divide-slate-800">
                {customFields.map((f: { key: string; value: string }) => (
                  <div key={f.key} className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0">
                    <dt className="text-sm text-slate-500 dark:text-slate-400">{f.key}</dt>
                    <dd className="truncate text-right text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {f.value || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-7 py-5">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}