"use client";

import { useEffect, useState } from "react";
import {
  FiPackage,
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiArrowUpRight,
  FiArrowDownRight,
  FiCreditCard,
  FiAlertCircle,
} from "react-icons/fi";

import { API_BASE } from "@/app/lib/api";

const API = `${API_BASE}/dashboard/`;

interface DashboardData {
  total_products: number;
  stock_value: number;
  today_sales: number;
  revenue: number;

  product_growth: number | null;
  stock_growth: number | null;
  sales_growth: number | null;
  revenue_growth: number | null;

  // Optional extra fields for the bottom-row info.
  // Provide these from the backend if available; UI falls back safely if not.
  total_stock_units?: number | null;
  low_stock_count?: number | null;
  today_profit?: number | null;
  monthly_profit?: number | null;
}

function safeNumber(value: number | null | undefined): number {
  return Number(value ?? 0);
}

function formatGrowth(value: number | null | undefined): string {
  const growth = Number(value ?? 0);
  return `${growth > 0 ? "+" : ""}${growth}%`;
}

function formatTimeAgo(date: Date | null): string {
  if (!date) return "just now";
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin === 1) return "1 min ago";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr} hr ago`;
}

// Health badge used on the Products / Stock Value cards
function HealthBadge({ healthy }: { healthy: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        healthy
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
          : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          healthy ? "bg-emerald-500" : "bg-red-500"
        }`}
      />
      {healthy ? "Healthy" : "Low Stock"}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="animate-pulse">
        <div className="flex items-center justify-between gap-1.5 min-w-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="h-11 w-11 rounded-xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-5 w-14 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="mt-4 h-7 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-2 h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />

        <div className="mt-5 flex items-center justify-between">
          <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

export default function StatCards() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [, forceTick] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchDashboard() {
      try {
        const response = await fetch(API);

        if (!response.ok) {
          throw new Error(`Dashboard API Error (${response.status})`);
        }

        const data = await response.json();

        if (mounted) {
          setDashboard(data);
          setError(null);
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.error(err);

        if (mounted) {
          setError("Unable to load dashboard.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    // Auto refresh every 30 seconds
    const interval = setInterval(fetchDashboard, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Re-render every 30s so "Updated X min ago" text stays fresh
  useEffect(() => {
    const tick = setInterval(() => forceTick((n) => n + 1), 30000);
    return () => clearInterval(tick);
  }, []);

  if (loading) {
    return (
      <section className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-3.5 xl:gap-5 w-full min-w-0">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </section>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-14 dark:border-red-900/50 dark:bg-red-950/30">
        <FiAlertCircle size={26} className="text-red-500 dark:text-red-400" />
        <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">
          {error || "Dashboard not available"}
        </h2>
        <p className="text-xs text-red-400 dark:text-red-400/70">
          Please make sure the Django API is running.
        </p>
      </div>
    );
  }

  const lowStockCount = dashboard.low_stock_count ?? 0;
  const timeAgo = formatTimeAgo(lastUpdated);

  const stats = [
    {
      title: "Total Products",
      subtitle: "Unique Products",
      value: safeNumber(dashboard.total_products).toLocaleString("en-IN"),
      growth: formatGrowth(dashboard.product_growth),
      rawGrowth: dashboard.product_growth ?? 0,
      icon: FiPackage,
      solid: "bg-blue-600",
      bottom: {
        type: "health" as const,
        healthy: lowStockCount === 0,
        rightLabel: "Low Stock",
        rightValue: `${lowStockCount}`,
      },
    },
    {
      title: "Stock Value",
      subtitle: "Current Inventory Value",
      value: `₹${safeNumber(dashboard.stock_value).toLocaleString("en-IN")}`,
      growth: formatGrowth(dashboard.stock_growth),
      rawGrowth: dashboard.stock_growth ?? 0,
      icon: FiDollarSign,
      solid: "bg-emerald-600",
      bottom: {
        type: "health" as const,
        healthy: lowStockCount === 0,
        rightLabel: "Low Stock",
        rightValue: `${lowStockCount} Items`,
      },
    },
    {
      title: "Today's Sales",
      subtitle: "Today's Sales",
      value: `₹${safeNumber(dashboard.today_sales).toLocaleString("en-IN")}`,
      growth: formatGrowth(dashboard.sales_growth),
      rawGrowth: dashboard.sales_growth ?? 0,
      icon: FiShoppingCart,
      solid: "bg-amber-600",
      bottom: {
        type: "meta" as const,
        profitLabel: "Profit",
        profitValue:
          dashboard.today_profit != null
            ? `₹${safeNumber(dashboard.today_profit).toLocaleString("en-IN")}`
            : "—",
        updatedText: `Updated ${timeAgo}`,
      },
    },
    {
      title: "Monthly Revenue",
      subtitle: "This Month Revenue",
      value: `₹${safeNumber(dashboard.revenue).toLocaleString("en-IN")}`,
      growth: formatGrowth(dashboard.revenue_growth),
      rawGrowth: dashboard.revenue_growth ?? 0,
      icon: FiTrendingUp,
      solid: "bg-indigo-600",
      bottom: {
        type: "meta" as const,
        profitLabel: "Profit",
        profitValue:
          dashboard.monthly_profit != null
            ? `₹${safeNumber(dashboard.monthly_profit).toLocaleString(
                "en-IN"
              )}`
            : "—",
        updatedText: `Updated ${timeAgo}`,
      },
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-3.5 xl:gap-5 w-full min-w-0">
      {stats.map((item) => {
        const Icon = item.icon;
        const isNoChange = item.rawGrowth === 0;

        const GrowthIcon = isNoChange
          ? FiTrendingUp
          : item.rawGrowth > 0
          ? FiArrowUpRight
          : FiArrowDownRight;

        const growthColor = isNoChange
          ? "text-slate-500 dark:text-slate-400"
          : item.rawGrowth > 0
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-500 dark:text-red-400";

        const growthBg = isNoChange
          ? "bg-slate-100 dark:bg-slate-800"
          : item.rawGrowth > 0
          ? "bg-emerald-50 dark:bg-emerald-950/40"
          : "bg-red-50 dark:bg-red-950/40";

        return (
          <div
            key={item.title}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 p-3 sm:p-4 lg:p-3.5 xl:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-200 hover:shadow-[0_4px_14px_rgba(15,23,42,0.08)] dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_4px_14px_rgba(0,0,0,0.4)] min-w-0 w-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <span
                  className={`flex h-8 w-8 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl ${item.solid} text-white shadow-sm`}
                >
                  <Icon size={18} strokeWidth={2} />
                </span>
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                  {item.title}
                </p>
              </div>

              <span
                className={`inline-flex shrink-0 items-center gap-0.5 rounded-full ${growthBg} px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold ${growthColor}`}
              >
                <GrowthIcon size={11} />
                {item.growth}
              </span>
            </div>

            {/* Value */}
            <div className="mt-2.5 sm:mt-3 xl:mt-4 min-w-0">
              <h2 className="text-lg sm:text-xl xl:text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                {item.value}
              </h2>
              <p className="mt-0.5 text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {item.subtitle}
              </p>
            </div>

            {/* Bottom section */}
            <div className="mt-3 sm:mt-4 xl:mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2.5 sm:pt-3 xl:pt-4 text-[10px] sm:text-[11px] min-w-0 gap-1">
              {item.bottom.type === "health" ? (
                <>
                  <HealthBadge healthy={item.bottom.healthy} />
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 dark:text-slate-400">
                    {item.bottom.rightLabel}:{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-300">
                      {item.bottom.rightValue}
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-violet-600 dark:bg-violet-950/40 dark:text-violet-400 truncate">
                    <FiCreditCard size={11} />
                    {item.bottom.profitLabel}: {item.bottom.profitValue}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400">
                    {item.bottom.updatedText}
                  </span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}