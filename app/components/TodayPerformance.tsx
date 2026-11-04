"use client";
import { API_BASE } from "@/app/lib/api";

import { useEffect, useState } from "react";
import {
  FiSun,
  FiDollarSign,
  FiFileText,
  FiCreditCard,
  FiCheckCircle,
  FiTarget,
} from "react-icons/fi";

interface PerfData {
  today_revenue: number;
  today_bills: number;
  today_avg_bill: number;

  revenue_delta: number;
  bills_delta: number;
  avg_bill_delta: number;

  profit: number;
  last_bill_time: string;
  completed_bills: number;
  items_sold: number;
  highest_bill: number;
  customers_count: number;
}

export default function TodayPerformance() {
  const [data, setData] = useState<PerfData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = () => {
      fetch(`${API_BASE}/dashboard/today-performance/`)
        .then((r) => r.json())
        .then((d) => {
          if (mounted) {
            setData(d);
            setLoading(false);
          }
        })
        .catch(() => {
          if (mounted) setLoading(false);
        });
    };

    load();
    const iv = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);

  const formatCurrency = (n: number) =>
    "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  const dailyTarget = 20000;
  const currentRev = data?.today_revenue ?? 0;
  const targetPct = Math.min(Math.round((currentRev / dailyTarget) * 100), 100);

  if (loading) {
    return (
      <div className="flex flex-col h-full w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 sm:p-5 space-y-4">
        {/* Header Shimmer */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl youtube-shimmer shrink-0" />
            <div className="space-y-1.5 min-w-0">
              <div className="h-4 w-32 rounded-md youtube-shimmer" />
              <div className="h-3 w-40 rounded-md youtube-shimmer" />
            </div>
          </div>
          <div className="h-6 w-16 rounded-full youtube-shimmer" />
        </div>

        {/* Target Widget Shimmer */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3.5 space-y-2.5">
          <div className="flex justify-between items-center">
            <div className="h-3 w-32 rounded-md youtube-shimmer" />
            <div className="h-3 w-20 rounded-md youtube-shimmer" />
          </div>
          <div className="h-2.5 w-full rounded-full youtube-shimmer" />
          <div className="flex justify-between items-center">
            <div className="h-2.5 w-24 rounded-md youtube-shimmer" />
            <div className="h-2.5 w-20 rounded-md youtube-shimmer" />
          </div>
        </div>

        {/* 3 Metric Cards Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-1 gap-2.5 sm:gap-3 flex-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg youtube-shimmer shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-2.5 w-20 rounded-md youtube-shimmer" />
                  <div className="h-4 w-28 rounded-md youtube-shimmer" />
                </div>
              </div>
              <div className="space-y-1.5 text-right">
                <div className="h-2.5 w-16 rounded-md youtube-shimmer ml-auto" />
                <div className="h-2.5 w-20 rounded-md youtube-shimmer ml-auto" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Shimmer */}
        <div className="h-7 w-full rounded-lg youtube-shimmer mt-auto" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200">
      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md">
            <FiSun size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
              Today's Performance
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Live business pulse & daily target
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-800 px-3 py-1 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
            Live
          </span>
        </div>
      </div>

      {/* ─── Body Content ───────────────────────────────── */}
      <div className="p-3.5 sm:p-5 flex-1 space-y-3.5 sm:space-y-4 min-w-0">
        {/* 1. Daily Sales Target Widget */}
        <div className="rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/30 p-3.5">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
              <FiTarget size={14} className="text-amber-500" /> Daily Target (₹20,000)
            </span>
            <span className="text-amber-700 dark:text-amber-400">{targetPct}% Achieved</span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-amber-200/60 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
              style={{ width: `${Math.max(targetPct, 3)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 mt-1.5">
            <span>Progress: {formatCurrency(currentRev)}</span>
            <span>Target: ₹20,000</span>
          </div>
        </div>

        {/* 2. Vertical Metric Cards (Clean & Responsive) */}
        {!data ? (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-1 gap-2.5 sm:gap-3 min-w-0">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-xl youtube-shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-1 gap-2.5 sm:gap-3 min-w-0">
            {/* Card 1: Today Revenue */}
            <div className="group flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 p-3 transition-all hover:border-amber-200 dark:hover:border-amber-900 hover:bg-white dark:hover:bg-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400 font-bold">
                  <FiDollarSign size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Today Revenue
                  </p>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight">
                    {formatCurrency(data.today_revenue)}
                  </h3>
                </div>
              </div>

              <div className="text-right text-[11px]">
                <span className="font-semibold text-slate-500 dark:text-slate-400 block">
                  Profit: <span className="text-emerald-600 font-bold">{formatCurrency(data.profit ?? 0)}</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Last Bill: {data.last_bill_time ?? "--"}
                </span>
              </div>
            </div>

            {/* Card 2: Bills Created */}
            <div className="group flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 p-3 transition-all hover:border-blue-200 dark:hover:border-blue-900 hover:bg-white dark:hover:bg-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 font-bold">
                  <FiFileText size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Bills Created
                  </p>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight">
                    {data.today_bills}
                  </h3>
                </div>
              </div>

              <div className="text-right text-[11px]">
                <span className="font-semibold text-slate-500 dark:text-slate-400 block">
                  Items Sold: <span className="text-slate-700 dark:text-slate-200 font-bold">{data.items_sold ?? 0}</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Completed: {data.completed_bills ?? 0}
                </span>
              </div>
            </div>

            {/* Card 3: Avg Bill Value */}
            <div className="group flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 p-3 transition-all hover:border-emerald-200 dark:hover:border-emerald-900 hover:bg-white dark:hover:bg-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 font-bold">
                  <FiCreditCard size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Avg Bill Value
                  </p>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight">
                    {formatCurrency(data.today_avg_bill)}
                  </h3>
                </div>
              </div>

              <div className="text-right text-[11px]">
                <span className="font-semibold text-slate-500 dark:text-slate-400 block">
                  Highest: <span className="text-blue-600 font-bold">{formatCurrency(data.highest_bill ?? 0)}</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Customers: {data.customers_count ?? 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Footer ─────────────────────────────────────── */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 px-5 py-2.5 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <FiCheckCircle size={12} className="text-amber-500" />
          Goal: 750 Monthly Bills
        </span>
        <span>Updates Live</span>
      </div>
    </div>
  );
}
