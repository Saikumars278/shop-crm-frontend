"use client";
import { API_BASE } from "@/app/lib/api";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiPackage,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiCpu,
  FiExternalLink,
} from "react-icons/fi";

interface StockItem {
  id: number;
  name: string;
  stock: number;
  category: string;
  unit?: string;
}

interface StockOverviewData {
  available: number;
  low_stock: number;
  out_of_stock: number;
  total_stock: number;
  total_products?: number;
  utilization: number;
  stock_alert: number;
  status: string;
  low_stock_items?: StockItem[];
  out_of_stock_items?: StockItem[];
}

export default function StockOverview() {
  const [data, setData] = useState<StockOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/stock-overview/`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-full min-h-[460px] w-full p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 box-border">
        {/* Header Shimmer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl youtube-shimmer" />
            <div className="space-y-1.5">
              <div className="h-4 w-28 rounded-md youtube-shimmer" />
              <div className="h-3 w-40 rounded-md youtube-shimmer" />
            </div>
          </div>
          <div className="h-6 w-28 rounded-full youtube-shimmer" />
        </div>

        {/* 3 Metric Cards Shimmer */}
        <div className="grid grid-cols-3 gap-3">
          <div className="h-20 rounded-xl youtube-shimmer" />
          <div className="h-20 rounded-xl youtube-shimmer" />
          <div className="h-20 rounded-xl youtube-shimmer" />
        </div>

        {/* Progress Bar Shimmer */}
        <div className="h-16 rounded-xl youtube-shimmer" />

        {/* 2-Column Product Grid Shimmer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
          <div className="h-36 rounded-xl youtube-shimmer" />
          <div className="h-36 rounded-xl youtube-shimmer" />
        </div>

        {/* Footer Insight Shimmer */}
        <div className="h-12 rounded-xl youtube-shimmer" />
      </div>
    );
  }

  const available = data?.available ?? 0;
  const lowStock = data?.low_stock ?? 0;
  const outOfStock = data?.out_of_stock ?? 0;
  const rawTotal = (data?.total_products ?? (available + lowStock + outOfStock));
  const totalProducts = rawTotal > 0 ? rawTotal : 0;
  const hasProducts = totalProducts > 0;

  const lowStockItems = data?.low_stock_items ?? [];
  const outOfStockItems = data?.out_of_stock_items ?? [];

  // Accurate percentages: Never force outPct = 100 when outOfStock = 0
  const availPct = hasProducts ? Math.round((available / totalProducts) * 100) : 0;
  const lowPct = hasProducts ? Math.round((lowStock / totalProducts) * 100) : 0;
  const outPct = hasProducts && outOfStock > 0
    ? Math.min(100, Math.max(0, 100 - availPct - lowPct))
    : 0;

  const isHealthy = hasProducts && outOfStock === 0 && lowStock === 0;

  return (
    <div className="flex flex-col h-full min-h-[460px] w-full box-border overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200">
      {/* ─── 1. Header ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4 gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <FiPackage size={17} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
              Stock Overview
            </h2>
            <p className="text-[11px] text-slate-400">Actionable Inventory Management</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
            !hasProducts
              ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              : isHealthy
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
              : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
          }`}
        >
          {!hasProducts ? (
            <>
              <FiPackage size={12} />
              Catalog Empty
            </>
          ) : isHealthy ? (
            <>
              <FiTrendingUp size={12} />
              Healthy Stock
            </>
          ) : (
            <>
              <FiAlertTriangle size={12} />
              Attention Required
            </>
          )}
        </span>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5 overflow-y-auto">
        <div className="space-y-3.5">
          {/* ─── 2. Summary Metric Cards (Available, Low Stock, Out of Stock) ─── */}
          <div className="grid grid-cols-3 gap-3">
            {/* Available */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/30 p-2.5 sm:p-3 transition-colors">
              <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                <FiCheckCircle size={12} /> Available
              </div>
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">{available}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{availPct}% catalog</span>
            </div>

            {/* Low Stock */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/30 p-2.5 sm:p-3 transition-colors">
              <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                <FiAlertTriangle size={12} /> Low Stock
              </div>
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">{lowStock}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">&le; 10 units</span>
            </div>

            {/* Out of Stock */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/30 p-2.5 sm:p-3 transition-colors">
              <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
                <FiXCircle size={12} /> Out of Stock
              </div>
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">{outOfStock}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Critical alert</span>
            </div>
          </div>

          {/* ─── 3. Inventory Health Progress Bar ─── */}
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3 sm:p-3.5">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-700 dark:text-slate-200">Inventory Health Ratio</span>
              <span
                className={
                  !hasProducts
                    ? "text-slate-500 dark:text-slate-400 font-bold"
                    : isHealthy
                    ? "text-emerald-600 dark:text-emerald-400 font-bold"
                    : "text-amber-600 dark:text-amber-400 font-bold"
                }
              >
                {hasProducts ? `${availPct}% Healthy` : "Catalog Empty (0%)"}
              </span>
            </div>

            {/* Segmented Progress Bar: Shows neutral empty track when totalProducts is 0, never false full red */}
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              {hasProducts && (
                <>
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${availPct}%` }}
                    title={`Available: ${availPct}%`}
                  />
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${lowPct}%` }}
                    title={`Low Stock: ${lowPct}%`}
                  />
                  <div
                    className="h-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${outPct}%` }}
                    title={`Out of Stock: ${outPct}%`}
                  />
                </>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 mt-1.5">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> In Stock ({available})
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Low ({lowStock})
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Out ({outOfStock})
              </span>
            </div>
          </div>

          {/* ─── 4. Actionable 2-Column Product Grid ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Low Stock Column */}
            <div className="rounded-xl border border-amber-100 dark:border-amber-900/40 bg-white dark:bg-slate-900 p-3.5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2.5 border-b border-amber-100 dark:border-amber-900/30 pb-2">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <FiAlertTriangle size={13} /> Low Stock ({lowStock})
                  </span>
                </div>

                <div className="space-y-2">
                  {lowStockItems.length === 0 ? (
                    <div className="py-4 text-center">
                      <FiCheckCircle className="mx-auto text-emerald-500 mb-1" size={16} />
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {!hasProducts ? "No products in store catalog." : "All products above minimum stock."}
                      </p>
                    </div>
                  ) : (
                    lowStockItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20"
                      >
                        <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[110px]">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-600 dark:text-amber-400 text-[11px] bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
                            {item.stock} {item.unit || "pcs"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Link
                href="/products"
                className="mt-3 inline-flex items-center justify-center gap-1.5 w-full rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold py-1.5 transition-colors shadow-2xs"
              >
                <FiRefreshCw size={12} /> {!hasProducts ? "Add Products" : "Restock Now"}
              </Link>
            </div>

            {/* Out of Stock Column */}
            <div className="rounded-xl border border-rose-100 dark:border-rose-900/40 bg-white dark:bg-slate-900 p-3.5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2.5 border-b border-rose-100 dark:border-rose-900/30 pb-2">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <FiXCircle size={13} /> Out of Stock ({outOfStock})
                  </span>
                </div>

                <div className="space-y-2">
                  {outOfStockItems.length === 0 ? (
                    <div className="py-4 text-center">
                      <FiCheckCircle className="mx-auto text-emerald-500 mb-1" size={16} />
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {!hasProducts ? "No catalog products registered." : "Zero stockouts across store catalog."}
                      </p>
                    </div>
                  ) : (
                    outOfStockItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20"
                      >
                        <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[110px]">
                          {item.name}
                        </span>
                        <span className="font-bold text-rose-600 dark:text-rose-400 text-[11px] bg-rose-100 dark:bg-rose-900/40 px-1.5 py-0.5 rounded">
                          0 Stock
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Link
                href="/products"
                className="mt-3 inline-flex items-center justify-center gap-1.5 w-full rounded-lg bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 text-[11px] font-bold py-1.5 transition-colors shadow-2xs"
              >
                <FiExternalLink size={12} /> View Products
              </Link>
            </div>
          </div>
        </div>

        {/* ─── 5. AI Inventory Insight Footer Banner ─── */}
        <div className="mt-auto flex items-start gap-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-950/30 p-3 text-xs shrink-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-white">
            <FiCpu size={13} />
          </div>
          <div>
            <span className="font-bold text-indigo-900 dark:text-indigo-300">AI Inventory Insight:</span>{" "}
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {!hasProducts ? (
                <>
                  No products registered in store catalog. Add products to start tracking inventory health, stock utilization, and restock alerts.
                </>
              ) : outOfStock > 0 ? (
                <>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">{outOfStock} products</span> are
                  currently out of stock
                  {outOfStockItems.length > 0 ? ` (including ${outOfStockItems.slice(0, 2).map((i) => i.name).join(", ")})` : ""}.
                  Prioritize restocking to maintain active customer sales.
                </>
              ) : lowStock > 0 ? (
                <>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{lowStock} products</span> are running low
                  {lowStockItems.length > 0 ? ` (including ${lowStockItems.slice(0, 2).map((i) => i.name).join(", ")})` : ""}.
                  Restock before depletion.
                </>
              ) : (
                <>
                  All inventory levels are optimal. Routine supplier delivery recommended in{" "}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">4 days</span>.
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
