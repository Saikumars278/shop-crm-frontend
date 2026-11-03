"use client";

import { useEffect, useState } from "react";
import { FiClock, FiAward, FiCpu, FiShoppingBag } from "react-icons/fi";

interface Product {
  rank: number;
  name: string;
  qty: number;
  revenue: number;
  bar_pct: number;
}

import { API_BASE } from "@/app/lib/api";

const API = `${API_BASE}/dashboard/top-products/`;

const RANK_CONFIG: Record<
  number,
  {
    badge: string;
    border: string;
    bg: string;
    barColor: string;
    tag: string;
    icon: string;
  }
> = {
  1: {
    badge: "bg-amber-500 text-white font-extrabold shadow-sm",
    border: "border-amber-200 dark:border-amber-800/80 shadow-md",
    bg: "bg-gradient-to-r from-amber-50/80 via-amber-50/40 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900",
    barColor: "bg-amber-500",
    tag: "👑 #1 Best Seller",
    icon: "👑",
  },
  2: {
    badge: "bg-slate-700 text-white font-bold",
    border: "border-slate-200 dark:border-slate-800",
    bg: "bg-white dark:bg-slate-900",
    barColor: "bg-slate-500",
    tag: "🥈 #2 Top Performer",
    icon: "🥈",
  },
  3: {
    badge: "bg-amber-700 text-white font-bold",
    border: "border-slate-200 dark:border-slate-800",
    bg: "bg-white dark:bg-slate-900",
    barColor: "bg-orange-500",
    tag: "🥉 #3 Volume Driver",
    icon: "🥉",
  },
};

export default function TopProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(API);
        const data = await res.json();
        if (alive) {
          setProducts(data.products ?? []);
          setLastUpdated(new Date());
        }
      } catch {
        if (alive) setProducts([]);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    const iv = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, []);

  const totalRev = products.reduce((sum, p) => sum + p.revenue, 0) || 1;
  const top3 = products.slice(0, 3);

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200">
      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md">
            <FiAward size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Top Products
              </h2>
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                Ranked Performance
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Top revenue drivers & volume leaders
            </p>
          </div>
        </div>

        {lastUpdated && (
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <FiClock size={10} />
            {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      {/* ─── Body: 3 Ranked Cards ────────────────────────── */}
      <div className="p-4 sm:p-5 flex-1 space-y-3.5 overflow-y-auto">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-1/3 bg-slate-200 rounded" />
                <div className="h-4 w-1/4 bg-slate-200 rounded" />
              </div>
              <div className="h-2 w-full bg-slate-200 rounded" />
            </div>
          ))
        ) : top3.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <FiShoppingBag size={24} className="text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-500">No sales recorded yet</p>
          </div>
        ) : (
          top3.map((p) => {
            const config = RANK_CONFIG[p.rank] || RANK_CONFIG[2];
            const salesPct = Math.round((p.revenue / totalRev) * 100);
            const isRank1 = p.rank === 1;

            return (
              <div
                key={p.rank}
                className={`relative rounded-xl border p-4 transition-all duration-200 ${config.border} ${config.bg} ${
                  isRank1 ? "ring-1 ring-amber-400/30" : "hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {/* Top Row: Rank Badge + Title + Tag */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs ${config.badge}`}
                    >
                      #{p.rank}
                    </span>
                    <div className="min-w-0">
                      <h3
                        className={`truncate font-bold leading-snug text-slate-800 dark:text-slate-100 ${
                          isRank1 ? "text-sm sm:text-base text-amber-900 dark:text-amber-300" : "text-xs sm:text-sm"
                        }`}
                      >
                        {p.name}
                      </h3>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {config.tag}
                      </span>
                    </div>
                  </div>

                  {/* Revenue Amount */}
                  <div className="text-right shrink-0">
                    <p
                      className={`font-black tabular-nums ${
                        isRank1 ? "text-base sm:text-lg text-amber-600 dark:text-amber-400" : "text-sm sm:text-base text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      ₹{p.revenue.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400">
                      {p.qty.toLocaleString("en-IN")} units sold
                    </p>
                  </div>
                </div>

                {/* Progress Bar & Percentage Share */}
                <div className="space-y-1 mt-3">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <span>Revenue Share</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{salesPct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${config.barColor}`}
                      style={{ width: `${Math.max(salesPct, 4)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── Footer AI Insight ───────────────────────────── */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/30 px-5 py-3 flex items-start gap-2.5 text-xs">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-500 text-white mt-0.5">
          <FiCpu size={12} />
        </div>
        <div>
          <span className="font-bold text-amber-900 dark:text-amber-300">AI Sales Insight:</span>{" "}
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            Rice 25Kg & India Gate Rice generate 75%+ of revenue. Maintain bulk safety stock above 20 units to safeguard cash flow.
          </span>
        </div>
      </div>
    </div>
  );
}