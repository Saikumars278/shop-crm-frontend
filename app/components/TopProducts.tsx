"use client";

import { useEffect, useState } from "react";
import { FiShoppingBag, FiPackage, FiClock, FiTrendingUp } from "react-icons/fi";

interface Product {
  rank: number;
  name: string;
  qty: number;
  revenue: number;
  bar_pct: number;
}

const API = "http://127.0.0.1:8000/api/dashboard/top-products/";

const RANK_STYLES: Record<number, { badge: string; bar: string }> = {
  1: { badge: "bg-amber-100 text-amber-700",    bar: "#f59e0b" },
  2: { badge: "bg-slate-100 text-slate-600",     bar: "#94a3b8" },
  3: { badge: "bg-orange-100 text-orange-600",   bar: "#f97316" },
};

const DEFAULT_BAR  = "#6366f1";
const DEFAULT_BADGE = "bg-slate-50 text-slate-500";

export default function TopProducts() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res  = await fetch(API);
        const data = await res.json();
        if (alive) { setProducts(data.products ?? []); setLastUpdated(new Date()); }
      } catch { if (alive) setProducts([]); }
      finally  { if (alive) setLoading(false); }
    };
    load();
    const iv = setInterval(load, 30_000);
    return () => { alive = false; clearInterval(iv); };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">

      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <FiPackage size={14} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-800 dark:text-white leading-tight">Top Products</p>
            <p className="text-[10px] text-slate-400 leading-tight">Best sellers by revenue</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
            <FiTrendingUp size={9} />
            Top {products.length}
          </span>
          {lastUpdated && (
            <span className="flex items-center gap-0.5 text-[9px] text-slate-400">
              <FiClock size={8} />
              {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      {/* ─── Column labels ───────────────────────────────── */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-[1.5rem_1fr_4rem_5.5rem] gap-x-3 bg-slate-50 dark:bg-slate-800/80 px-5 py-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">#</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Product</span>
          <span className="text-right text-[9px] font-bold uppercase tracking-widest text-slate-400">Units</span>
          <span className="text-right text-[9px] font-bold uppercase tracking-widest text-slate-400">Revenue</span>
        </div>
      )}

      {/* ─── Rows ────────────────────────────────────────── */}
      <div className="divide-y divide-slate-50 px-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse py-3">
              <div className="grid grid-cols-[1.5rem_1fr_4rem_5.5rem] items-center gap-x-3">
                <div className="h-5 w-5 rounded bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-2 w-3/4 rounded-full bg-slate-200" />
                  <div className="h-1 w-2/3 rounded-full bg-slate-100" />
                </div>
                <div className="ml-auto h-2 w-8 rounded-full bg-slate-200" />
                <div className="ml-auto h-2 w-12 rounded-full bg-slate-200" />
              </div>
            </div>
          ))
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <FiShoppingBag size={18} className="text-slate-400" />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No sales data yet</p>
            <p className="mt-0.5 text-[11px] text-slate-400">Products appear once bills are created.</p>
          </div>
        ) : (
          products.map((p) => {
            const style   = RANK_STYLES[p.rank];
            const badgeCls = style ? style.badge : DEFAULT_BADGE;
            const barColor = style ? style.bar   : DEFAULT_BAR;
            const barW     = Math.max(Math.min(p.bar_pct, 100), 3);

            return (
              <div key={p.rank} className="group grid grid-cols-[1.5rem_1fr_4rem_5.5rem] items-center gap-x-3 py-2.5">

                {/* Rank */}
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${badgeCls}`}>
                  {p.rank}
                </span>

                {/* Name + bar */}
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold text-slate-700 dark:text-slate-200 leading-tight group-hover:text-indigo-600 transition-colors duration-150">
                    {p.name}
                  </p>
                  {/* 5px bar */}
                  <div className="mt-1.5 h-[5px] w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${barW}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>

                {/* Units */}
                <p className="text-right text-[11px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                  {p.qty.toLocaleString("en-IN")}
                </p>

                {/* Revenue */}
                <p className="text-right text-[12px] font-bold tabular-nums text-slate-800 dark:text-white">
                  ₹{p.revenue.toLocaleString("en-IN")}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}