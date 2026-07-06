"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from "react-icons/fi";

const API = "http://127.0.0.1:8000/api/revenue-chart/";

interface RevenueChartData {
  month: string;
  revenue: number;
}

interface RevenueResponse {
  total_revenue: number;
  current_month: number;
  previous_month: number;
  growth: number;
  chart: RevenueChartData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-lg">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
        <p className="text-base font-bold text-blue-600">
          ₹{Number(payload[0].value).toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart() {
  const [data, setData] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRevenue() {
      try {
        const res = await fetch(API);
        if (!res.ok) throw new Error("Failed to fetch revenue");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchRevenue();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full min-h-[340px] items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-blue-500" />
          <p className="text-xs text-slate-400">Loading Revenue...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full min-h-[340px] items-center justify-center rounded-2xl border border-red-100 bg-red-50 shadow-sm">
        <p className="text-sm font-semibold text-red-500">Unable to load revenue data.</p>
      </div>
    );
  }

  const difference = data.current_month - data.previous_month;
  const isPositiveGrowth = data.growth >= 0;

  const hasRevenueData =
    data.chart.length > 0 &&
    data.chart.some((item) => Number(item.revenue) > 0);

  const displayChartData =
    data.chart.length === 1
      ? [{ month: "Prev", revenue: data.previous_month }, data.chart[0]]
      : data.chart;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <FiDollarSign size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Revenue Analytics</h2>
            <p className="text-[11px] text-slate-400">Monthly performance overview</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
          isPositiveGrowth
            ? "bg-emerald-50 text-emerald-700"
            : "bg-red-50 text-red-600"
        }`}>
          {isPositiveGrowth
            ? <FiTrendingUp size={12} />
            : <FiTrendingDown size={12} />}
          {isPositiveGrowth ? "+" : ""}{data.growth}% vs last month
        </span>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Revenue</p>
          <p className="mt-1.5 text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
            ₹{Number(data.total_revenue).toLocaleString("en-IN")}
          </p>
          <p className={`mt-1.5 text-[11px] font-semibold ${difference >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {difference >= 0 ? "▲" : "▼"} ₹{Math.abs(difference).toLocaleString("en-IN")} vs last month
          </p>
        </div>
        <div className="flex flex-col px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Last Month</p>
          <p className="mt-1.5 text-lg font-bold text-slate-700 dark:text-slate-200 leading-none">
            ₹{Number(data.previous_month).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex flex-col px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">This Month</p>
          <p className="mt-1.5 text-lg font-bold text-blue-600 leading-none">
            ₹{Number(data.current_month).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="flex-1 px-4 pb-4 pt-3">
        {hasRevenueData ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={displayChartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(value) =>
                  value >= 100000
                    ? `₹${value / 100000}L`
                    : value >= 1000
                    ? `₹${value / 1000}k`
                    : `₹${value}`
                }
                width={52}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                dot={{ r: 3.5, fill: "#fff", stroke: "#2563eb", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "#2563eb" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[240px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
            <FiDollarSign className="mb-2 text-slate-300" size={32} />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No Revenue Data</p>
            <p className="mt-1 text-xs text-slate-400">Chart will appear once revenue data is available.</p>
          </div>
        )}
      </div>
    </div>
  );
}