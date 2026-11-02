"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiCreditCard,
  FiArrowRight,
  FiCpu,
  FiShoppingBag,
  FiExternalLink,
  FiZap,
} from "react-icons/fi";

interface SaleLineItem {
  name: string;
  qty: number;
  price: number;
}

interface Sale {
  id: string;
  product: string;
  items: SaleLineItem[];
  qty: number;
  amount: number;
  status: string;
  payment_method: string;
  date: string;
  time: string;
}

interface ApiResponse {
  summary: {
    total_bills: number;
    total_revenue: number;
    average_bill: number;
    pending_payments: number;
  };
  sales: Sale[];
}

export default function RecentSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<ApiResponse["summary"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/dashboard/recent-sales/?sort=date_desc&page=1")
      .then((res) => res.json())
      .then((data: ApiResponse) => {
        setSales(data.sales || []);
        setSummary(data.summary || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const displaySales = sales.slice(0, 4);

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200">
      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-600 text-white shadow-md">
            <FiFileText size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Recent Grocery Bills
              </h2>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                Timeline
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live transaction stream & invoice logs
            </p>
          </div>
        </div>

        <Link
          href="/sales"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
        >
          View All <FiArrowRight size={13} />
        </Link>
      </div>

      {/* ─── Body: Compact Transaction Timeline / Cards ─── */}
      <div className="p-4 sm:p-5 flex-1 space-y-3 overflow-y-auto">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50"
            >
              <div className="space-y-1.5 w-1/2">
                <div className="h-3 w-3/4 bg-slate-200 rounded" />
                <div className="h-2 w-1/2 bg-slate-200 rounded" />
              </div>
              <div className="h-4 w-1/4 bg-slate-200 rounded" />
            </div>
          ))
        ) : displaySales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <FiShoppingBag size={24} className="text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-500">No transactions found</p>
          </div>
        ) : (
          displaySales.map((sale, index) => {
            const isLatest = index === 0;

            return (
              <div
                key={sale.id}
                className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
                  isLatest
                    ? "border-blue-200 dark:border-blue-900/80 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs ring-1 ring-blue-500/20"
                    : "border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                }`}
              >
                {/* Left: Invoice info + Product */}
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      isLatest
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <FiFileText size={14} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                        {sale.id}
                      </span>
                      {isLatest && (
                        <span className="inline-flex items-center rounded-md bg-blue-600 px-1.5 py-0.5 text-[9px] font-black uppercase text-white tracking-wider animate-pulse">
                          Latest
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {sale.product}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <FiClock size={10} /> {sale.time}
                      </span>
                      <span>•</span>
                      <span>{sale.qty} items</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        {sale.payment_method}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Status */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-2 sm:pt-0 shrink-0">
                  <span
                    className={`text-sm sm:text-base font-black tabular-nums ${
                      isLatest ? "text-blue-600 dark:text-blue-400" : "text-slate-800 dark:text-slate-100"
                    }`}
                  >
                    ₹{sale.amount.toLocaleString("en-IN")}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 mt-0.5">
                    <FiCheckCircle size={10} /> Paid
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── Footer AI Insight ───────────────────────────── */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-950/30 px-5 py-3 flex items-start gap-2.5 text-xs">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white mt-0.5">
          <FiCpu size={12} />
        </div>
        <div>
          <span className="font-bold text-blue-900 dark:text-blue-300">AI Billing Insight:</span>{" "}
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            Average transaction value is ₹4,343. Prompt cashiers to offer ₹15 impulse snack add-ons at checkout to boost basket size by 5-10%.
          </span>
        </div>
      </div>
    </div>
  );
}