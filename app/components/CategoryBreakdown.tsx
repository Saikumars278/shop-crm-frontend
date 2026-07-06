"use client";

import { useEffect, useState } from "react";
import { FiGrid, FiBox } from "react-icons/fi";

interface Category {
  name: string;
  count: number;
  stock_qty: number;
  inv_value: number;
  pct: number;
  color: string;
}

export default function CategoryBreakdown() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = () => {
      fetch("http://127.0.0.1:8000/api/dashboard/category-breakdown/")
        .then((r) => r.json())
        .then((d) => {
          if (mounted) {
            setCategories(d.categories);
            setTotalValue(d.total_value);
            setLoading(false);
          }
        })
        .catch(() => { if (mounted) setLoading(false); });
    };
    load();
    const iv = setInterval(load, 30000);
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
            <FiGrid size={26} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Inventory Value</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Breakdown by category</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white">
            Rs.{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Stacked bar */}
      {!loading && categories.length > 0 && (
        <div className="px-6 pt-5">
          <div className="flex h-3 overflow-hidden rounded-full">
            {categories.map((c) => (
              <div
                key={c.name}
                className="h-full transition-all duration-700"
                style={{ width: `${c.pct}%`, backgroundColor: c.color }}
                title={`${c.name}: ${c.pct}%`}
              />
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="h-4 w-4 rounded-full bg-slate-200" />
                <div className="flex-1 h-3 rounded bg-slate-200" />
                <div className="h-3 w-20 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <FiBox size={32} className="text-slate-300" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No category data available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((c) => (
              <div key={c.name} className="group flex items-center gap-4 rounded-2xl p-3 transition hover:bg-slate-50 dark:bg-slate-800">
                {/* Color dot */}
                <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                {/* Name + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{c.name}</span>
                    <span className="ml-2 shrink-0 text-xs font-bold" style={{ color: c.color }}>
                      {c.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${Math.max(c.pct, 3)}%`, backgroundColor: c.color }}
                    />
                  </div>
                </div>
                {/* Stats */}
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    Rs.{c.inv_value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-slate-400">{c.count} products</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
