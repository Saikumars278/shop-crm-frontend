"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { FiShoppingBag, FiTrendingUp, FiTrendingDown, FiStar } from "react-icons/fi";

const API = "http://127.0.0.1:8000/api/weekly-sales/";

interface ChartData {
  day: string;
  sales: number;
}

interface SalesResponse {
  total_sales: number;
  growth: number;
  highest_sale: {
    day: string;
    sales: number;
  };
  chart: ChartData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-lg">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
        <p className="text-base font-bold text-indigo-600">
          ₹{Number(payload[0].value).toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

export default function SalesChart() {
  const [data, setData] = useState<SalesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSales() {
      try {
        const res = await fetch(API);
        if (!res.ok) throw new Error("Failed to fetch weekly sales");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchSales();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full min-h-[340px] items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-indigo-500" />
          <p className="text-xs text-slate-400">Loading Weekly Sales...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full min-h-[340px] items-center justify-center rounded-2xl border border-red-100 bg-red-50 shadow-sm">
        <p className="text-sm font-semibold text-red-500">Unable to load weekly sales.</p>
      </div>
    );
  }

  const hasSalesData =
    data.chart.length > 0 &&
    data.chart.some((item) => Number(item.sales) > 0);

  const isPositiveGrowth = data.growth >= 0;

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const displayChartData = daysOfWeek.map((day) => {
    const existing = data.chart.find((item) => item.day === day);
    return existing || { day, sales: 0 };
  });

  const maxSalesDay = displayChartData.reduce(
    (max, item) => (item.sales > max.sales ? item : max),
    displayChartData[0]
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <FiShoppingBag size={15} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Weekly Sales</h2>
            <p className="text-[11px] text-slate-400">Last 7 days performance</p>
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
          {isPositiveGrowth ? "+" : ""}{data.growth}% vs last week
        </span>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Weekly Total</p>
          <p className="mt-1.5 text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
            ₹{Number(data.total_sales).toLocaleString("en-IN")}
          </p>
          <p className={`mt-1.5 text-[11px] font-semibold ${isPositiveGrowth ? "text-emerald-600" : "text-red-500"}`}>
            {isPositiveGrowth ? "▲" : "▼"} {Math.abs(data.growth)}% vs last week
          </p>
        </div>
        <div className="flex flex-col px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Best Day</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <FiStar size={12} className="text-amber-500" />
            <p className="text-lg font-bold text-slate-800 dark:text-white leading-none">
              {data.highest_sale.day || "—"}
            </p>
          </div>
        </div>
        <div className="flex flex-col px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Best Sales</p>
          <p className="mt-1.5 text-lg font-bold text-indigo-600 leading-none">
            ₹{Number(data.highest_sale.sales).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="flex-1 px-4 pb-4 pt-3">
        {hasSalesData ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={displayChartData}
              margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="day"
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
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(79,70,229,0.05)", radius: 6 }} />
              <Bar dataKey="sales" radius={[5, 5, 0, 0]} maxBarSize={40}>
                {displayChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.day === maxSalesDay?.day ? "#4f46e5" : "#c7d2fe"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[240px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
            <FiShoppingBag className="mb-2 text-slate-300" size={32} />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No Sales Data</p>
            <p className="mt-1 text-xs text-slate-400">Chart will appear once sales data is available.</p>
          </div>
        )}
      </div>
    </div>
  );
}