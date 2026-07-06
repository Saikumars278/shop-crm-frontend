"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiClock, FiAlertCircle, FiArrowRight, FiBox } from "react-icons/fi";

interface ExpiryProduct {
  id: number;
  name: string;
  category: string;
  expiry_date: string;
  days_left: number;
  status: "Expired" | "Expiring Soon" | "Fresh";
}

interface ExpiryAlertsResponse {
  expired: number;
  expiring_soon: number;
  products: ExpiryProduct[];
}

// Point this at your Django host, e.g. via env var.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function ExpiryAlerts() {
  const router = useRouter();
  const [products, setProducts] = useState<ExpiryProduct[]>([]);
  const [expiredCount, setExpiredCount] = useState(0);
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchExpiryAlerts() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/expiry-alerts/`);

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data: ExpiryAlertsResponse = await res.json();

        if (cancelled) return;

        // Backend already filters out "Fresh" items and orders by
        // expiry_date; just sort by days_left ascending so the most
        // critical ones (most negative / smallest) show first.
        const sorted = [...data.products].sort(
          (a, b) => a.days_left - b.days_left
        );

        setProducts(sorted);
        setExpiredCount(data.expired);
        setExpiringSoonCount(data.expiring_soon);
      } catch (err) {
        if (!cancelled) {
          setError("Could not load expiry alerts.");
          setProducts([]);
          setExpiredCount(0);
          setExpiringSoonCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchExpiryAlerts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">

      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white shadow-sm">
            <FiClock size={14} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[13px] font-bold leading-tight text-slate-800 dark:text-white">Expiry Alerts</p>
            <p className="text-[10px] leading-tight text-slate-400">Products expiring in 10 days</p>
          </div>
        </div>

        <button
          onClick={() => router.push('/products')}
          className="rounded-lg bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-600 transition hover:bg-rose-100"
        >
          View All
        </button>
      </div>

      {/* ─── Summary KPI ────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 border-b border-slate-50 bg-slate-50 dark:bg-slate-800/50 p-4">
        <div className="rounded-xl border border-rose-100 bg-white dark:bg-slate-900 p-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-500">
            <FiAlertCircle size={12} /> Expired
          </div>
          <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">{expiredCount}</p>
        </div>
        <div className="rounded-xl border border-orange-100 bg-white dark:bg-slate-900 p-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-500">
            <FiClock size={12} /> In 10 Days
          </div>
          <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">{expiringSoonCount}</p>
        </div>
      </div>

      {/* ─── Column labels ───────────────────────────────── */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-[1fr_4.5rem_4rem_4.5rem] gap-x-3 bg-slate-50 dark:bg-slate-800/80 px-5 py-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Product</span>
          <span className="text-right text-[9px] font-bold uppercase tracking-widest text-slate-400">Date</span>
          <span className="text-right text-[9px] font-bold uppercase tracking-widest text-slate-400">Days</span>
          <span className="text-right text-[9px] font-bold uppercase tracking-widest text-slate-400">Status</span>
        </div>
      )}

      {/* ─── Rows ────────────────────────────────────────── */}
      <div className="divide-y divide-slate-50 px-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse py-3">
              <div className="grid grid-cols-[1fr_4.5rem_4rem_4.5rem] items-center gap-x-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 shrink-0 rounded bg-slate-200" />
                  <div className="space-y-1.5 w-full">
                    <div className="h-2 w-2/3 rounded-full bg-slate-200" />
                    <div className="h-1.5 w-1/2 rounded-full bg-slate-100" />
                  </div>
                </div>
                <div className="ml-auto h-2 w-10 rounded-full bg-slate-200" />
                <div className="ml-auto h-2 w-6 rounded-full bg-slate-200" />
                <div className="ml-auto h-4 w-12 rounded bg-slate-200" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
              <FiAlertCircle size={18} />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{error}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">Please try again shortly.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
              <FiBox size={18} />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Inventory looks good</p>
            <p className="mt-0.5 text-[11px] text-slate-400">No products expiring soon.</p>
          </div>
        ) : (
          products.map((p) => {
            const isExpired = p.status === "Expired";
            const badgeCls = isExpired
              ? "bg-rose-100 text-rose-700"
              : "bg-orange-100 text-orange-700";

            return (
              <div key={p.id} className="group grid grid-cols-[1fr_4.5rem_4rem_4.5rem] items-center gap-x-3 py-2.5">

                {/* Name + Category */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded font-bold text-[10px] ${isExpired ? "bg-rose-50 text-rose-500" : "bg-orange-50 text-orange-500"
                    }`}>
                    <FiBox size={12} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold leading-tight text-slate-700 dark:text-slate-200 group-hover:text-rose-600 transition-colors duration-150">
                      {p.name}
                    </p>
                    <p className="truncate text-[10px] font-medium text-slate-400">
                      {p.category}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <p className="text-right text-[11px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                  {p.expiry_date}
                </p>

                {/* Days Left */}
                <p className={`text-right text-[12px] font-bold tabular-nums ${isExpired ? "text-rose-600" : "text-slate-800"}`}>
                  {isExpired ? "—" : `${p.days_left}d`}
                </p>

                {/* Status */}
                <div className="flex justify-end">
                  <span className={`inline-flex rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeCls}`}>
                    {p.status}
                  </span>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}