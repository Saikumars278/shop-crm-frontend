"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiCpu,
  FiAlertCircle,
  FiTrendingUp,
  FiClock,
  FiShoppingBag,
  FiRefreshCw,
  FiZap,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";

interface Recommendation {
  id: string;
  type: "Restock" | "Best Seller" | "Expiry Alert" | "Sales Opportunity" | "Discount";
  product: string;
  currentData: string;
  suggestedAction: string;
  impact?: string;
}

import { API_BASE } from "@/app/lib/api";

const API_URL = `${API_BASE}/dashboard/ai-recommendations/`;

const TYPE_STYLES = {
  Restock: {
    badge: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900",
    iconBg: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
    icon: FiAlertCircle,
  },
  "Best Seller": {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900",
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    icon: FiTrendingUp,
  },
  "Expiry Alert": {
    badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900",
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    icon: FiClock,
  },
  "Sales Opportunity": {
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-900",
    iconBg: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400",
    icon: FiZap,
  },
  Discount: {
    badge: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-900",
    iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
    icon: FiShoppingBag,
  },
};

export default function AiRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>("-");

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.recommendations)) {
          setRecommendations(data.recommendations);
          setLastRefreshed(data.last_updated || new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch AI Recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="flex flex-col h-full min-h-[460px] w-full box-border overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md">
            <FiCpu size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                🤖 AI Recommendations
              </h2>
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                Live Insights
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Smart business actions to increase sales &amp; profit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/ai-recommendations"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 px-2.5 py-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition active:scale-95"
          >
            <FiTrendingUp size={12} />
            <span>Next Month Forecast &rarr;</span>
          </Link>
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Refresh AI Insights"
          >
            <FiRefreshCw size={14} className={loading ? "animate-spin text-indigo-600" : ""} />
          </button>
        </div>
      </div>

      {/* Body: Recommendation List */}
      <div className="p-4 sm:p-5 flex-1 space-y-3.5 overflow-y-auto">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-slate-100 dark:border-slate-800 p-3.5 bg-slate-50/50 space-y-2.5">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-1/6 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
              </div>
            ))}
          </>
        ) : recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <FiCheckCircle size={32} className="text-emerald-500 mb-2 opacity-80" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">All Operations Optimal</p>
            <p className="text-xs text-slate-400 mt-1">No urgent stockouts, expiry warnings, or margin risks detected.</p>
          </div>
        ) : (
          recommendations.map((rec) => {
            const style = TYPE_STYLES[rec.type] || TYPE_STYLES.Restock;
            const Icon = style.icon;

            return (
              <div
                key={rec.id}
                className="group relative rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 p-3.5 transition-all duration-200 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-xs"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.iconBg} mt-0.5`}>
                    <Icon size={16} />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 truncate">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${style.badge}`}>
                          {rec.type}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {rec.product}
                        </h4>
                      </div>
                      {rec.impact && (
                        <span className="shrink-0 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                          {rec.impact}
                        </span>
                      )}
                    </div>

                    {/* Current Data */}
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Data:</span>{" "}
                      {rec.currentData}
                    </p>

                    {/* Suggested Action */}
                    <div className="flex items-start gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900/60 rounded-lg p-2 border border-slate-100 dark:border-slate-800">
                      <FiArrowRight size={13} className="shrink-0 mt-0.5 text-indigo-500" />
                      <span>{rec.suggestedAction}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 px-5 py-2.5 flex items-center justify-between text-[11px] text-slate-400">
        <Link
          href="/ai-recommendations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
        >
          <FiZap size={13} className="text-amber-500" />
          <span>Next Month Forecast &amp; Strategy &rarr;</span>
        </Link>
        <span>Updated: {lastRefreshed}</span>
      </div>
    </div>
  );
}
