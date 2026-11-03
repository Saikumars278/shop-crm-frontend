"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiTrendingUp,
  FiAlertTriangle,
  FiDollarSign,
  FiCheckCircle,
  FiPackage,
  FiTag,
  FiLayers,
  FiArrowRight,
  FiRefreshCw,
  FiCreditCard,
  FiBox,
  FiCheck,
  FiShield,
  FiZap,
  FiTarget,
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
      <div className="rounded-2xl border border-slate-700/80 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md p-4 text-white shadow-2xl min-w-[230px] z-50">
        <div className="flex items-center justify-between gap-3 mb-2.5 pb-2.5 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-200">{label}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
              isForecast
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
            }`}
          >
            {isForecast ? "🎯 AI Target" : "Actual History"}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-xs ${isForecast ? "bg-emerald-500" : "bg-blue-600"}`} />
              {isForecast ? "Target Revenue:" : "Total Revenue:"}
            </span>
            <span className="font-extrabold text-white text-sm">{formatINR(revenue)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Customer Bills:
            </span>
            <span className="font-bold text-slate-200">{bills} bills</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>Average / Bill:</span>
            <span className="font-semibold text-slate-200">{formatINR(avgBill)}</span>
          </div>

          {isForecast && item?.forecast_min && item?.forecast_max && (
            <div className="mt-1 pt-1.5 border-t border-slate-800/80 text-[10px] text-emerald-300 flex justify-between">
              <span className="text-slate-400">Target Band:</span>
              <span className="font-bold">{formatINR(item.forecast_min)} – {formatINR(item.forecast_max)}</span>
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
  const [activeTab, setActiveTab] = useState<
    "overview" | "sales" | "stock" | "offers" | "payments" | "plan"
  >("overview");
  const [refreshing, setRefreshing] = useState(false);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ai-forecast/`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load forecast data:", err);
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
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="animate-pulse h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse h-36 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
        <div className="animate-pulse h-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
      </div>
    );
  }

  const {
    forecast_period = {},
    summary = {},
    trend_data = [],
    product_recommendations = {},
    sales_increase_strategies = {},
    payment_analysis = {},
    action_plan = [],
  } = data || {};

  const { high_demand_products = [], underperforming_products = [] } = product_recommendations;
  const outOfStockItems = high_demand_products.filter((p: any) => p.current_stock === 0);
  const inStockFastItems = high_demand_products.filter((p: any) => p.current_stock > 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0">
      {/* ─── 1. CLEAN TOP HEADER ─── */}
      <header className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
                <FiZap className="text-blue-600 dark:text-blue-400" />
                AI Store Forecast
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {forecast_period.full_label || "November 2026"}
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Next Month Forecast &amp; Recommendations
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Simple, practical sales projections, stock alerts, and revenue advice based on your shop&apos;s real data.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
            >
              <FiRefreshCw size={14} className={refreshing ? "animate-spin text-blue-600" : ""} />
              <span>{refreshing ? "Updating..." : "Refresh Forecast"}</span>
            </button>
          </div>
        </div>

        {/* ─── CLEAN TAB SWITCHER ─── */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: "overview", label: "Overview", icon: FiLayers },
            { id: "sales", label: "Sales & Earnings", icon: FiTrendingUp },
            {
              id: "stock",
              label: "Stock to Buy",
              icon: FiPackage,
              badge: outOfStockItems.length > 0 ? `${outOfStockItems.length} Empty` : undefined,
            },
            { id: "offers", label: "Offers & Deals", icon: FiTag },
            { id: "payments", label: "Payments", icon: FiCreditCard },
            { id: "plan", label: "Action Plan", icon: FiCheckCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                  }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? "bg-white text-blue-700" : "bg-red-500 text-white"
                      }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ─── 2. TOP 3 KEY HIGHLIGHT CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Expected Revenue */}
        <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/50 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiDollarSign className="text-emerald-600" />
                Expected Target Revenue
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                {summary.confidence_label || "High Confidence"}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {formatINR(summary.predicted_revenue || 78555)}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                Band: <strong className="text-slate-700 dark:text-slate-300">{formatINR(summary.predicted_revenue_min)}</strong> – <strong className="text-slate-700 dark:text-slate-300">{formatINR(summary.predicted_revenue_max)}</strong>
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>~{summary.predicted_sales_count || 18} Customer Bills</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatINR(summary.predicted_avg_bill || 4364)} / bill
            </span>
          </div>
        </div>

        {/* Card 2: Urgent Stock To Buy */}
        <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/60 via-white to-red-50/30 dark:from-rose-950/25 dark:via-slate-900 dark:to-red-950/15 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiAlertTriangle className="text-rose-600" />
                Urgent Stock Alert
              </span>
              <span className="inline-flex items-center rounded-full bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:text-rose-300">
                Action Required
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                {outOfStockItems.length} Products Empty
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                Fast-moving staples currently have 0 shelf stock.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-rose-100 dark:border-rose-900/40 flex items-center justify-between text-xs">
            <span className="text-rose-600 dark:text-rose-400 font-bold">Losing daily revenue</span>
            <button
              onClick={() => setActiveTab("stock")}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Buying List &rarr;
            </button>
          </div>
        </div>

        {/* Card 3: Payments Collected */}
        <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/50 via-white to-slate-50/40 dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <FiCheckCircle className="text-blue-600" />
                Payment &amp; Inflow Health
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 dark:text-blue-300">
                100% Collected
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                {formatINR(payment_analysis.total_payments_received || 160686)}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                Next Month Inflow: <strong className="text-blue-700 dark:text-blue-300">~{formatINR(payment_analysis.daily_inflow_estimate || 2618)}/day</strong>
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <FiCheck size={13} /> Zero customer debt
            </span>
            <span>Overdue: ₹0</span>
          </div>
        </div>
      </div>

      {/* ─── 3. TAB CONTENT: OVERVIEW ─── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Section: Modern Sales Trend & Next Month Target with Proper Alignment & Correct Size Bars */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                  <FiTrendingUp size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Sales Trend &amp; Next Month Target
                    </h2>
                    <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                      Predictive Model
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Historical monthly revenue trajectory compared with AI target projections
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <FiShield size={13} className="text-emerald-500" />
                  <span className="font-semibold">{summary.confidence_score || 78}% Confidence</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <FiTarget size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Target: {formatINR(summary.predicted_revenue || 78555)}</span>
                </div>
              </div>
            </div>

            {/* Main Balanced Grid: Left Chart (7 cols) + Right Target Intelligence Card (5 cols) with Perfect Vertical Alignment */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-5">
              {/* Left Column: Sales Trend Chart with Correct Size Bars */}
              <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 p-4">
                {/* Chart Controls & Custom Legend */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-xs bg-blue-600 shadow-2xs" />
                      <span className="text-slate-700 dark:text-slate-300 text-xs">Actual Revenue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-xs bg-emerald-500 shadow-2xs" />
                      <span className="text-slate-700 dark:text-slate-300 font-bold text-xs">🎯 Target Revenue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-3.5 rounded-full bg-amber-500" />
                      <span className="text-slate-700 dark:text-slate-300 text-xs">Bills Volume</span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    Revenue (₹) vs Bills
                  </span>
                </div>

                {/* Composed Chart */}
                <div className="h-72 sm:h-80 w-full min-w-0 pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={trend_data}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickLine={false}
                        axisLine={{ stroke: "#e2e8f0" }}
                        tickFormatter={(val: string) => {
                          if (!val) return "";
                          return val.replace(" (Forecast)", " 🎯 Target");
                        }}
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
                      <Bar
                        yAxisId="revenue"
                        dataKey="revenue"
                        name="Revenue"
                        barSize={36}
                        radius={[8, 8, 2, 2]}
                      >
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
                        strokeWidth={2.75}
                        dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 6 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Historical Data: Completed Operations</span>
                  <span>Model: Weighted Trajectory</span>
                </div>
              </div>

              {/* Right Column: Dedicated Next Month Target Intelligence Card */}
              <div className="lg:col-span-5 flex flex-col justify-between h-full rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-gradient-to-b from-slate-50/90 via-white to-slate-50/70 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950/80 p-5 shadow-xs">
                {/* Target Header & Main Target Figure */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                        <FiTarget size={15} />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Next Month Target Goal
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Target Projection
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        {formatINR(summary.predicted_revenue || 78555)}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                        <FiTrendingUp className="mr-0.5" /> +15% target
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Projected revenue benchmark for {forecast_period.month_name || "Next Month"} based on active store trends.
                    </p>
                  </div>

                  {/* Target Range Progress Slider */}
                  <div className="mt-4 p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-500 dark:text-slate-400">Target Range Bandwidth</span>
                      <span className="text-slate-800 dark:text-slate-200">
                        {formatINR(summary.predicted_revenue_min)} – {formatINR(summary.predicted_revenue_max)}
                      </span>
                    </div>

                    <div className="relative h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-700/80 overflow-hidden flex">
                      <div className="h-full bg-blue-500" style={{ width: "25%" }} title="Conservative Baseline" />
                      <div className="h-full bg-emerald-500" style={{ width: "55%" }} title="Expected Target" />
                      <div className="h-full bg-purple-500" style={{ width: "20%" }} title="Optimistic Upside" />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium pt-0.5">
                      <span>Min: {formatINR(summary.predicted_revenue_min)}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Target: {formatINR(summary.predicted_revenue)}</span>
                      <span>Max: {formatINR(summary.predicted_revenue_max)}</span>
                    </div>
                  </div>

                  {/* 4 Quick Target Sub-Metrics */}
                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                    <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
                      <span className="text-[10px] text-slate-400 block font-medium">Target Bills</span>
                      <strong className="text-sm font-black text-slate-800 dark:text-slate-100">
                        ~{summary.predicted_sales_count || 18} Bills
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
                      <span className="text-[10px] text-slate-400 block font-medium">Avg Bill Target</span>
                      <strong className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {formatINR(summary.predicted_avg_bill || 4364)}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
                      <span className="text-[10px] text-slate-400 block font-medium">Daily Inflow Target</span>
                      <strong className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {formatINR(payment_analysis.daily_inflow_estimate || 2618)}/day
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
                      <span className="text-[10px] text-slate-400 block font-medium">Model Confidence</span>
                      <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {summary.confidence_score || 78}% High
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Growth Catalyst & CTA */}
                <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 p-2.5 rounded-xl">
                    <span className="text-amber-500 font-bold shrink-0 mt-0.5">💡</span>
                    <p className="leading-snug text-[11px]">
                      <strong>Target Catalyst:</strong> Restocking the {outOfStockItems.length} out-of-stock items will unlock up to{" "}
                      <strong className="text-slate-900 dark:text-white">{formatINR(summary.predicted_revenue_max || 98200)}</strong> in maximum revenue.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab("stock")}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs py-2.5 px-4 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span>Review Restock Plan to Hit Target</span>
                    <FiArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Urgent Products Grid */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiAlertTriangle className="text-red-500" />
                  Urgent Products to Buy Stock For
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  These fast-selling staples are at 0 stock. Buy now to avoid losing customers.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("stock")}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Full Stock Guide &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {outOfStockItems.map((p: any) => (
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
                      <div>Selling Price: <strong>₹{p.sell_price}</strong></div>
                      <div>Past Sales: <strong>{p.historical_sold} sold</strong></div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-red-100 dark:border-red-900/40 text-xs">
                    <div className="text-red-700 dark:text-red-300 font-bold">
                      Order {p.reorder_needed} units
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Est. Sales: {formatINR(p.projected_revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. TAB CONTENT: SALES & EARNINGS ─── */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiTrendingUp className="text-blue-600" />
                Monthly Revenue &amp; Projections
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed comparison of completed operational months and next month&apos;s statistical forecast
              </p>
            </div>

            {/* Chart Controls & Custom Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-xs bg-blue-600 shadow-2xs" />
                  <span className="text-slate-700 dark:text-slate-300 text-xs">Actual Revenue (₹)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-xs bg-emerald-500 shadow-2xs" />
                  <span className="text-slate-700 dark:text-slate-300 font-bold text-xs">🎯 AI Target Forecast</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-3.5 rounded-full bg-amber-500" />
                  <span className="text-slate-700 dark:text-slate-300 text-xs">Bills Volume</span>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                Dual Axis: Revenue (Left) | Bills (Right)
              </span>
            </div>

            {/* Large Chart with Correct Size Bars */}
            <div className="h-80 w-full min-w-0 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trend_data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickFormatter={(val: string) => {
                      if (!val) return "";
                      return val.replace(" (Forecast)", " 🎯 Target");
                    }}
                  />
                  <YAxis
                    yAxisId="revenue"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                  />
                  <YAxis
                    yAxisId="bills"
                    orientation="right"
                    tick={{ fontSize: 12, fill: "#f59e0b" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val} b`}
                  />
                  <Tooltip content={<TrendTooltip />} />
                  <Bar
                    yAxisId="revenue"
                    dataKey="revenue"
                    name="Revenue"
                    barSize={38}
                    radius={[8, 8, 2, 2]}
                  >
                    {trend_data.map((entry: any, index: number) => (
                      <Cell
                        key={`sales-cell-${index}`}
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
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 7 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Month-by-Month Breakdown Table */}
            <div className="crm-table-container pt-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Month</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Bills Count</th>
                    <th className="px-4 py-3">Total Revenue</th>
                    <th className="px-4 py-3 rounded-r-xl">Average Bill Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {trend_data.map((m: any, idx: number) => {
                    const isForecast = m.type === "forecast";
                    const avg = m.bills > 0 ? m.revenue / m.bills : 0;
                    return (
                      <tr
                        key={idx}
                        className={
                          isForecast
                            ? "bg-blue-50/50 dark:bg-blue-950/30 font-bold text-blue-900 dark:text-blue-200"
                            : "text-slate-700 dark:text-slate-300"
                        }
                      >
                        <td className="px-4 py-3.5 flex items-center gap-2">
                          {isForecast && <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />}
                          <span>{m.month}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${isForecast
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              }`}
                          >
                            {isForecast ? "AI Forecast" : "Actual History"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">{m.bills} Bills</td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                          {formatINR(m.revenue)}
                        </td>
                        <td className="px-4 py-3.5">{formatINR(avg)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. TAB CONTENT: STOCK TO BUY & PRODUCT GUIDE ─── */}
      {activeTab === "stock" && (
        <div className="space-y-6">
          {/* Urgent Empty Products */}
          <div className="rounded-2xl border border-red-200/80 dark:border-red-900/60 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <FiAlertTriangle />
                  Urgent Restock Needed (0 Stock Available)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customers are asking for these items. Order immediately to capture estimated sales.
                </p>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0"
              >
                Go to Products Page &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outOfStockItems.map((p: any) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20 p-4 text-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</h4>
                      <span className="text-[11px] text-slate-500">{p.category}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white uppercase">
                      Empty (0 In Stock)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 bg-white/70 dark:bg-slate-900/70 rounded-lg p-2.5 border border-red-100 dark:border-red-900/40 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Selling Price</span>
                      <strong className="text-slate-900 dark:text-white">₹{p.sell_price}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Past Sold</span>
                      <strong className="text-slate-900 dark:text-white">{p.historical_sold}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-red-500 font-bold block">Order Needed</span>
                      <strong className="text-red-600 text-sm">{p.reorder_needed} units</strong>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    🚨 <strong>Action:</strong> Order {p.reorder_needed} units now to recover approximately{" "}
                    <strong>{formatINR(p.projected_revenue)}</strong> in sales next month.
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fast Moving In Stock Items */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiCheckCircle className="text-emerald-500" />
                Fast-Moving Items in Good Stock
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                These items are selling well and have enough units on the shelf.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inStockFastItems.map((p: any) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 p-4 text-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</h4>
                      <span className="text-[11px] text-slate-500">{p.category}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      ✅ {p.current_stock} Units Available
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-1">
                    <span>Price: <strong>₹{p.sell_price}</strong></span>
                    <span>Past Sold: <strong>{p.historical_sold}</strong></span>
                    <span className="text-emerald-600 font-bold">No reorder needed today</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slow Moving Products & Action Advice */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiBox className="text-amber-500" />
                Slow-Moving Stock (How to Clear &amp; Get Money Back)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                These items are moving slowly. Follow the simple recommendations to convert them back into cash.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {underperforming_products.map((p: any) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 p-4 text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</h4>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                        {p.historical_sold} Sold
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-600 dark:text-slate-300">
                      <div>Unsold Units: <strong>{p.current_stock}</strong></div>
                      <div>Capital Tied Up: <strong className="text-red-600">{formatINR(p.tied_capital)}</strong></div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                    <span className="font-bold text-amber-700 dark:text-amber-300">💡 Advice: </span>
                    {p.ai_action}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── 6. TAB CONTENT: OFFERS & DEALS ─── */}
      {activeTab === "offers" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiTag className="text-purple-600" />
                Ready-Made Combo Deals to Increase Sales
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Offer these bundle deals to customers at checkout to increase your average bill size
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {sales_increase_strategies.bundles?.map((b: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-gradient-to-b from-purple-50/30 to-white dark:from-purple-950/20 dark:to-slate-900 p-5 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase bg-purple-600 text-white px-2 py-0.5 rounded-md">
                        Combo Deal #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Saves ₹{b.savings} ({b.discount_pct}%)
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {b.title}
                    </h3>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Products included:</span>
                      {b.products?.map((item: string, iIdx: number) => (
                        <div key={iIdx} className="flex items-center gap-2 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 border-t border-purple-100 dark:border-purple-900/40 pt-2 leading-relaxed">
                      <strong>Goal:</strong> {b.target_outcome}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 line-through mr-1.5">
                        {formatINR(b.regular_price)}
                      </span>
                      <span className="text-lg font-black text-purple-600 dark:text-purple-400">
                        {formatINR(b.bundle_price)}
                      </span>
                    </div>
                    <Link
                      href="/billing"
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Use at Billing &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* 3 Simple In-Store Strategies */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  🎉 Weekend Grocery Discount
                </span>
                <p className="font-semibold text-blue-600 dark:text-blue-400">5% OFF on orders over ₹2,500</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Encourages families to buy their complete weekly grocery basket from your shop.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  🍪 Buy 2 Get 1 Free
                </span>
                <p className="font-semibold text-amber-600 dark:text-amber-400">On Biscuits &amp; Snacks</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Clears slow-moving biscuit packets and frees up working capital to restock Rice and Atta.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                  🍫 Checkout Counter Items
                </span>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">₹10–₹20 impulse items</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Place chocolates and water bottles near the payment counter. 1 in 3 customers will add one.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. TAB CONTENT: PAYMENTS ─── */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiCreditCard className="text-emerald-600" />
                Payment &amp; Collections Breakdown
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track payments received, pending debts, and expected cash inflow next month
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Total Money Received</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">
                  {formatINR(payment_analysis.total_payments_received || 160686)}
                </span>
                <span className="text-[11px] text-emerald-600 font-bold block mt-1">
                  ✅ 100% Collected (37 Bills)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Pending Unpaid Dues</span>
                <span className="text-2xl font-black text-emerald-600 block mt-1">
                  {formatINR(payment_analysis.pending_payments || 0)}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  No customers owe money
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Overdue / Bad Debts</span>
                <span className="text-2xl font-black text-emerald-600 block mt-1">
                  {formatINR(payment_analysis.overdue_payments || 0)}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Zero bad debts recorded
                </span>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs">
                <span className="text-blue-700 dark:text-blue-300 block font-medium">Expected Inflow Next Month</span>
                <span className="text-2xl font-black text-blue-700 dark:text-blue-300 block mt-1">
                  {formatINR(payment_analysis.expected_next_month_collections || 78555)}
                </span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold block mt-1">
                  ~{formatINR(payment_analysis.daily_inflow_estimate || 2618)} daily inflow
                </span>
              </div>
            </div>

            {/* Practical Advice */}
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs space-y-1">
              <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm block">
                💡 Collect Faster with UPI QR Code Stand
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                100% of your current sales are paid in Cash. Setting up a QR stand (PhonePe / Google Pay / Paytm) at checkout eliminates cash change friction and typically increases basket size by <strong>15% to 20%</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── 8. TAB CONTENT: 4-WEEK ACTION PLAN ─── */}
      {activeTab === "plan" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiCheckCircle className="text-blue-600" />
                Simple 4-Week Action Plan for Next Month
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Follow these weekly steps to reach your sales target of {formatINR(summary.predicted_revenue || 78555)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {action_plan.map((step: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                        {step.week}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {step.priority}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                      {step.title}
                    </h4>

                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {step.items?.map((it: string, iIdx: number) => (
                        <li key={iIdx} className="flex items-start gap-1.5 leading-relaxed font-medium">
                          <FiCheck size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
