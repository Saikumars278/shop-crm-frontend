"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiTrendingUp,
  FiAlertTriangle,
  FiDollarSign,
  FiCreditCard,
  FiRefreshCw,
  FiShield,
  FiZap,
  FiTarget,
  FiInfo,
  FiPlusCircle,
  FiShoppingBag,
  FiCalendar,
  FiBarChart2,
  FiPackage,
  FiArrowRight,
} from "react-icons/fi";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { API_BASE } from "@/app/lib/api";

function formatINR(val: number | undefined | null) {
  if (val === undefined || val === null || isNaN(val)) return "₹0";
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

const TrendTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0]?.payload;
    const isForecast = item?.type === "forecast";
    const revenue = payload.find((p: any) => p.dataKey === "revenue")?.value ?? item?.revenue ?? 0;
    const bills = payload.find((p: any) => p.dataKey === "bills")?.value ?? item?.bills ?? 0;
    const avgBill = bills > 0 ? Math.round(revenue / bills) : 0;

    return (
      <div className="rounded-xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-md p-3.5 text-white shadow-xl min-w-[210px] z-50 text-xs">
        <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-800">
          <span className="font-bold text-slate-200">{label}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
              isForecast
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
            }`}
          >
            {isForecast ? "🎯 Target Forecast" : "Actual History"}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-xs ${isForecast ? "bg-emerald-500" : "bg-blue-600"}`} />
              {isForecast ? "Target Revenue:" : "Total Revenue:"}
            </span>
            <span className="font-extrabold text-white text-sm">{formatINR(revenue)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Customer Bills:
            </span>
            <span className="font-semibold text-slate-200">{bills} bills</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>Average / Bill:</span>
            <span className="font-medium text-slate-200">{formatINR(avgBill)}</span>
          </div>

          {isForecast && item?.forecast_min !== undefined && item?.forecast_max !== undefined && (
            <div className="mt-1 pt-1 border-t border-slate-800/80 text-[10px] text-emerald-300 flex justify-between">
              <span className="text-slate-400">Target Range:</span>
              <span className="font-semibold">{formatINR(item.forecast_min)} – {formatINR(item.forecast_max)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function AiForecastDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchForecast = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`${API_BASE}/ai-forecast/`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setFetchError("Unable to retrieve forecast data from server.");
      }
    } catch (err: any) {
      console.error("Failed to load forecast data:", err);
      setFetchError("Failed to connect to backend server. Please verify backend service.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchForecast();
  };

  if (loading && !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0">
        {/* 1. Header Shimmer */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2.5">
            <div className="flex gap-2">
              <div className="h-6 w-44 rounded-full youtube-shimmer" />
              <div className="h-6 w-32 rounded-full youtube-shimmer" />
            </div>
            <div className="h-7 w-72 rounded-lg youtube-shimmer" />
            <div className="h-4 w-96 max-w-full rounded-md youtube-shimmer" />
          </div>
          <div className="flex gap-2.5">
            <div className="h-9 w-24 rounded-xl youtube-shimmer" />
            <div className="h-9 w-32 rounded-xl youtube-shimmer" />
          </div>
        </div>

        {/* 2. Top 4 KPI Cards Shimmer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between h-40"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 rounded-md youtube-shimmer" />
                <div className="h-5 w-20 rounded-full youtube-shimmer" />
              </div>
              <div className="space-y-2 my-2">
                <div className="h-8 w-36 rounded-lg youtube-shimmer" />
                <div className="h-3 w-44 rounded-md youtube-shimmer" />
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                <div className="h-3 w-20 rounded-md youtube-shimmer" />
                <div className="h-3 w-24 rounded-md youtube-shimmer" />
              </div>
            </div>
          ))}
        </div>

        {/* 3. Main Chart & Target Benchmark Shimmer */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1.5">
              <div className="h-5 w-64 rounded-md youtube-shimmer" />
              <div className="h-3 w-80 rounded-md youtube-shimmer" />
            </div>
            <div className="h-8 w-44 rounded-xl youtube-shimmer" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
            <div className="lg:col-span-7 h-80 rounded-xl bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="h-4 w-48 rounded youtube-shimmer" />
                <div className="h-4 w-24 rounded youtube-shimmer" />
              </div>
              <div className="h-52 w-full rounded-lg youtube-shimmer" />
              <div className="h-3 w-40 rounded youtube-shimmer" />
            </div>
            <div className="lg:col-span-5 h-80 rounded-xl bg-slate-50 dark:bg-slate-950/40 p-5 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-36 rounded youtube-shimmer" />
                  <div className="h-4 w-24 rounded-full youtube-shimmer" />
                </div>
                <div className="h-8 w-32 rounded-lg youtube-shimmer" />
                <div className="h-16 rounded-xl youtube-shimmer" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-14 rounded-xl youtube-shimmer" />
                  <div className="h-14 rounded-xl youtube-shimmer" />
                </div>
              </div>
              <div className="h-9 rounded-xl youtube-shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    has_data = false,
    has_sales = false,
    has_products = false,
    forecast_period = {},
    summary = {},
    trend_data = [],
    inventory_alerts = {},
    product_recommendations = {},
    payment_analysis = {},
  } = data || {};

  // Strict calculation: if historical_total_bills is 0, NEVER display 15 Bills or any default
  const historicalBills = Number(summary?.historical_total_bills ?? 0);
  const hasRealSales = Boolean(has_sales && historicalBills > 0);
  const projectedBills = hasRealSales ? Number(summary?.predicted_sales_count ?? 0) : 0;
  const avgBasketValue = hasRealSales && projectedBills > 0 ? Number(summary?.predicted_avg_bill ?? 0) : 0;

  const { high_demand_products = [] } = product_recommendations;
  const outOfStockItems = inventory_alerts.out_of_stock_items || high_demand_products.filter((p: any) => p.current_stock === 0);
  const lowStockItems = inventory_alerts.low_stock_items || [];
  const outOfStockCount = inventory_alerts.out_of_stock_count ?? outOfStockItems.length;
  const lowStockCount = inventory_alerts.low_stock_count ?? lowStockItems.length;

  const nextMonthName = forecast_period.month_name || "Next Month";
  const fullPeriodLabel = forecast_period.full_label || `${nextMonthName} Forecast`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0">
      {/* ─── 1. TOP HEADER ─── */}
      <header className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
                <FiZap className="text-blue-600 dark:text-blue-400" />
                Store Forecast &amp; Recommendations
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <FiCalendar className="mr-1 text-emerald-600 dark:text-emerald-400" />
                {fullPeriodLabel}
              </span>
              {hasRealSales && summary.confidence_score > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <FiShield size={12} className="text-emerald-500" />
                  {summary.confidence_label} ({summary.confidence_score}%)
                </span>
              )}
            </div>
            <h1 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Next Month Forecast &amp; Recommendations
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Real database sales projections, customer bill volume, inventory alerts, and payment collections for {nextMonthName}.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/billing"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 text-white px-3.5 py-2 text-xs font-bold hover:bg-blue-700 transition-all shadow-xs"
            >
              <FiShoppingBag size={14} />
              <span>New Bill</span>
            </Link>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
              title="Refresh Forecast Data"
            >
              <FiRefreshCw size={13} className={refreshing ? "animate-spin text-blue-600" : ""} />
              <span>{refreshing ? "Updating..." : "Refresh Forecast"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── EMPTY STATE BANNER (WHEN NO SALES RECORDED) ─── */}
      {!hasRealSales && (
        <div className="rounded-2xl border border-amber-300/80 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                <FiInfo size={20} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  No Historical Sales Data Available Yet
                </h3>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  The Next Month Forecast uses your store&apos;s actual checkout records and inventory levels to predict target revenues, bill volumes, and buying requirements. Record your sales at the billing counter to generate predictive analytics.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <Link
                href="/billing"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-bold hover:bg-blue-700 transition-all shadow-xs"
              >
                <FiPlusCircle size={14} />
                <span>Record First Sale</span>
              </Link>
              {!has_products && (
                <Link
                  href="/products"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  <FiPackage size={14} />
                  <span>Add Products</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── DATA LIMITATION / RELIABILITY NOTE (WHEN SALES EXIST) ─── */}
      {hasRealSales && summary.data_limitation_note && (
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-3.5 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
          <FiShield className="text-emerald-500 mt-0.5 shrink-0" size={14} />
          <div className="leading-relaxed">
            <strong className="text-slate-800 dark:text-slate-200 font-semibold">Data Reliability: </strong>
            {summary.data_limitation_note}
          </div>
        </div>
      )}

      {/* ─── 2. TOP 4 KEY HIGHLIGHT CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Expected Revenue Target */}
        <div className="rounded-2xl border border-emerald-200/90 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/60 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiDollarSign className="text-emerald-600" />
                Target Revenue
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                {hasRealSales ? summary.confidence_label || "Active Model" : "Awaiting Sales"}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {hasRealSales ? formatINR(summary.predicted_revenue) : "₹0"}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                {hasRealSales && summary.predicted_revenue_min !== undefined ? (
                  <>
                    Band: <strong className="text-slate-700 dark:text-slate-300">{formatINR(summary.predicted_revenue_min)}</strong> – <strong className="text-slate-700 dark:text-slate-300">{formatINR(summary.predicted_revenue_max)}</strong>
                  </>
                ) : (
                  "Target band generates upon sales history"
                )}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>{nextMonthName} Goal</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {hasRealSales && summary.daily_target_revenue ? `~${formatINR(summary.daily_target_revenue)}/day` : "₹0/day"}
            </span>
          </div>
        </div>

        {/* Card 2: Customer Invoices (Consistent with DB) */}
        <div className="rounded-2xl border border-blue-200/90 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/60 via-white to-white dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-800 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiTarget className="text-blue-600" />
                Customer Invoices
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                {hasRealSales ? "Projected" : "No Data"}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                {projectedBills > 0 ? `${projectedBills} Bills` : "0 Bills"}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                {hasRealSales && avgBasketValue > 0 ? (
                  <>
                    Avg Basket: <strong className="text-slate-700 dark:text-slate-300">{formatINR(avgBasketValue)}</strong> / bill
                  </>
                ) : (
                  <>
                    Avg Basket: <strong className="text-slate-700 dark:text-slate-300">₹0</strong> / bill
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Historical Bills</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {historicalBills} recorded
            </span>
          </div>
        </div>

        {/* Card 3: Stock Alert & Buying Needs */}
        <div className="rounded-2xl border border-rose-200/90 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/60 via-white to-white dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiAlertTriangle className="text-rose-600" />
                Inventory Alerts
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  outOfStockCount > 0
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                }`}
              >
                {outOfStockCount > 0 ? "Action Required" : "Stock Healthy"}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                {outOfStockCount} Out of Stock
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                {lowStockCount > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">{lowStockCount} additional items low on stock</span>
                ) : (
                  "All other items have adequate stock"
                )}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-rose-100 dark:border-rose-900/40 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Total Products: {inventory_alerts.total_products_count || 0}</span>
            <Link
              href="/products"
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Restock &rarr;
            </Link>
          </div>
        </div>

        {/* Card 4: Payment Collections Inflow */}
        <div className="rounded-2xl border border-indigo-200/90 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/60 via-white to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiCreditCard className="text-indigo-600" />
                Expected Inflow
              </span>
              <span className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                {hasRealSales && payment_analysis.collection_efficiency_pct ? `${payment_analysis.collection_efficiency_pct}% Realized` : "Inflow"}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
                {hasRealSales ? formatINR(payment_analysis.expected_next_month_collections) : "₹0"}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                {hasRealSales && payment_analysis.daily_inflow_estimate ? (
                  <>
                    Run-Rate: <strong className="text-indigo-700 dark:text-indigo-300">~{formatINR(payment_analysis.daily_inflow_estimate)}/day</strong>
                  </>
                ) : (
                  "Pending revenue collection pace"
                )}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Collected: {formatINR(payment_analysis.total_payments_received)}</span>
            <Link
              href="/reports"
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
            >
              Reports &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 3. MAIN DASHBOARD CONTENT: TREND CHART & TARGET INTELLIGENCE ─── */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <FiTrendingUp size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Sales Trend &amp; {nextMonthName} Forecast Target
                  </h2>
                  <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                    Recency-Weighted Model
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real historical monthly revenues mapped against the next calendar month&apos;s statistical target
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300">
                <FiShield size={13} className="text-emerald-500" />
                <span className="font-semibold">{hasRealSales ? summary.confidence_score || 0 : 0}% Reliability</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <FiTarget size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>Target: {hasRealSales ? formatINR(summary.predicted_revenue) : "₹0"}</span>
              </div>
            </div>
          </div>

          {/* Main Balanced Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-5">
            {/* Left Column: Sales Trend Chart */}
            <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 p-4">
              {/* Custom Legend */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-xs bg-blue-600" />
                    <span className="text-slate-700 dark:text-slate-300">Actual Revenue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" />
                    <span className="text-slate-700 dark:text-slate-300 font-bold">🎯 Next Month Target</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-3 rounded-full bg-amber-500" />
                    <span className="text-slate-700 dark:text-slate-300">Invoices</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Revenue (₹) vs Bills</span>
              </div>

              {/* Composed Chart OR Empty State */}
              {hasRealSales && trend_data.length > 0 ? (
                <div className="h-72 sm:h-80 w-full min-w-0 pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trend_data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={{ stroke: "#cbd5e1" }}
                        tickFormatter={(val: string) => (val ? val.replace(" (Forecast)", " 🎯 Target") : "")}
                      />
                      <YAxis
                        yAxisId="revenue"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `₹${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                      />
                      <YAxis
                        yAxisId="bills"
                        orientation="right"
                        tick={{ fontSize: 11, fill: "#f59e0b" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `${val} b`}
                      />
                      <Tooltip content={<TrendTooltip />} />
                      <Bar yAxisId="revenue" dataKey="revenue" name="Revenue" barSize={34} radius={[6, 6, 2, 2]}>
                        {trend_data.map((entry: any, index: number) => (
                          <Cell
                            key={`overview-cell-${index}`}
                            fill={entry.type === "forecast" ? "#10b981" : "#3b82f6"}
                          />
                        ))}
                      </Bar>
                      <Line
                        yAxisId="bills"
                        type="monotone"
                        dataKey="bills"
                        name="Bills Count"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 6 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 sm:h-80 w-full flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center">
                  <FiBarChart2 size={36} className="text-slate-300 dark:text-slate-600 mb-2" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Sales Trajectory Available</h4>
                  <p className="mt-1 text-xs text-slate-400 max-w-sm">
                    Start billing customers to build monthly revenue trends and dynamic forecasting curves.
                  </p>
                  <Link
                    href="/billing"
                    className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-blue-700"
                  >
                    <FiShoppingBag size={12} />
                    <span>Open Billing Screen</span>
                  </Link>
                </div>
              )}

              <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Actual Data: {historicalBills} Bills</span>
                <span>Model: Recency-Weighted Momentum</span>
              </div>
            </div>

            {/* Right Column: Dedicated Target Intelligence Card */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/60 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950/80 p-5 shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <FiTarget size={15} />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {nextMonthName} Target Benchmark
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      hasRealSales
                        ? "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                        : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold"
                    }`}
                  >
                    {hasRealSales ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Dynamic Projection
                      </>
                    ) : (
                      "Awaiting Sales"
                    )}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {hasRealSales ? formatINR(summary.predicted_revenue) : "₹0"}
                    </span>
                    {hasRealSales && summary.growth_rate_pct !== undefined && summary.growth_rate_pct !== 0 && (
                      <span
                        className={`text-xs font-bold flex items-center ${
                          summary.growth_rate_pct > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        <FiTrendingUp className="mr-0.5" />
                        {summary.growth_rate_pct > 0 ? `+${summary.growth_rate_pct}%` : `${summary.growth_rate_pct}%`} vs prior
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Projected baseline for {nextMonthName} derived from active store sales density.
                  </p>
                </div>

                {/* Target Range Progress Slider: Empty neutral track when 0, dynamic segments when real */}
                {(() => {
                  const minVal = hasRealSales ? Number(summary?.predicted_revenue_min ?? 0) : 0;
                  const targetVal = hasRealSales ? Number(summary?.predicted_revenue ?? 0) : 0;
                  const maxVal = hasRealSales ? Number(summary?.predicted_revenue_max ?? 0) : 0;
                  const hasBandwidth = hasRealSales && maxVal > 0 && targetVal > 0;

                  const minPct = hasBandwidth ? Math.max(5, Math.min(80, Math.round((minVal / maxVal) * 100))) : 0;
                  const targetPct = hasBandwidth ? Math.max(5, Math.min(95 - minPct, Math.round(((targetVal - minVal) / maxVal) * 100))) : 0;
                  const maxPct = hasBandwidth ? Math.max(0, 100 - minPct - targetPct) : 0;

                  return (
                    <div className="mt-4 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-500 dark:text-slate-400">Target Range Bandwidth</span>
                        <span className="text-slate-800 dark:text-slate-200">
                          {hasBandwidth ? `${formatINR(minVal)} – ${formatINR(maxVal)}` : "₹0 – ₹0"}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="relative h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex">
                        {hasBandwidth && (
                          <>
                            <div
                              className="h-full bg-blue-500 transition-all duration-500"
                              style={{ width: `${minPct}%` }}
                              title={`Conservative Baseline: ${formatINR(minVal)}`}
                            />
                            <div
                              className="h-full bg-emerald-500 transition-all duration-500"
                              style={{ width: `${targetPct}%` }}
                              title={`Target Forecast: ${formatINR(targetVal)}`}
                            />
                            <div
                              className="h-full bg-purple-500 transition-all duration-500"
                              style={{ width: `${maxPct}%` }}
                              title={`Optimistic Max: ${formatINR(maxVal)}`}
                            />
                          </>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium pt-0.5">
                        <span>Min: {hasBandwidth ? formatINR(minVal) : "₹0"}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          Target: {hasBandwidth ? formatINR(targetVal) : "₹0"}
                        </span>
                        <span>Max: {hasBandwidth ? formatINR(maxVal) : "₹0"}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* 4 Target Sub-Metrics */}
                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400 block font-medium">Target Bills</span>
                    <strong className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                      {projectedBills > 0 ? `${projectedBills} Bills` : "0 Bills"}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400 block font-medium">Avg Bill Target</span>
                    <strong className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                      {avgBasketValue > 0 ? formatINR(avgBasketValue) : "₹0"}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400 block font-medium">Daily Inflow Goal</span>
                    <strong className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                      {hasRealSales && payment_analysis.daily_inflow_estimate ? `${formatINR(payment_analysis.daily_inflow_estimate)}/day` : "₹0/day"}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400 block font-medium">Model Reliability</span>
                    <strong className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {hasRealSales && summary.confidence_score ? `${summary.confidence_score}% Score` : "0% No Data"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Card Bottom: Growth Catalyst */}
              <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800 space-y-2.5">
                {hasRealSales && outOfStockCount > 0 && summary.predicted_revenue_max > 0 ? (
                  <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 p-2.5 rounded-xl">
                    <span className="text-amber-500 font-bold shrink-0 mt-0.5">💡</span>
                    <p className="leading-snug text-[11px]">
                      <strong>Target Catalyst:</strong> Restocking the {outOfStockCount} empty item{outOfStockCount > 1 ? "s" : ""} will restore up to{" "}
                      <strong className="text-slate-900 dark:text-white">{formatINR(summary.predicted_revenue_max)}</strong> in potential store revenue.
                    </p>
                  </div>
                ) : hasRealSales && outOfStockCount === 0 ? (
                  <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 p-2.5 rounded-xl">
                    <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✅</span>
                    <p className="leading-snug text-[11px]">
                      <strong>Inventory Ready:</strong> Zero stockouts across your store catalog. All products are ready for active billing.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 p-2.5 rounded-xl">
                    <span className="text-blue-500 font-bold shrink-0 mt-0.5">💡</span>
                    <p className="leading-snug text-[11px]">
                      <strong>Getting Started:</strong> Record customer transactions at the billing counter to calculate monthly growth and activate dynamic target projections.
                    </p>
                  </div>
                )}

                <Link
                  href={!hasRealSales ? "/billing" : outOfStockCount > 0 ? "/products" : "/billing"}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs py-2 px-3 shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span>
                    {!hasRealSales
                      ? "Record First Sale in POS"
                      : outOfStockCount > 0
                      ? "Review & Restock Inventory"
                      : "Open Billing Screen"}
                  </span>
                  <FiArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Urgent Products Grid (when items are empty) */}
        {outOfStockCount > 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiAlertTriangle className="text-red-500" />
                  Urgent Products to Restock Immediately
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  These items are completely out of stock. Order now to prevent missed revenue and lost sales.
                </p>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Manage Products &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {outOfStockItems.slice(0, 4).map((p: any) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20 p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {p.name}
                      </h4>
                      <span className="text-[10px] font-extrabold uppercase bg-red-600 text-white px-1.5 py-0.5 rounded">
                        0 Stock
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <div>Price: <strong>₹{p.sell_price}</strong></div>
                      <div>Category: <strong>{p.category}</strong></div>
                      {p.historical_sold > 0 && (
                        <div>Past Sales: <strong>{p.historical_sold} {p.unit || "units"}</strong></div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-red-100 dark:border-red-900/40 text-xs">
                    <div className="text-red-700 dark:text-red-300 font-bold">
                      Reorder: {p.reorder_needed || 10} {p.unit || "units"}
                    </div>
                    {p.projected_revenue > 0 && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Est. Lost Sales: {formatINR(p.projected_revenue)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
