"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import {
  FiPackage,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiActivity,
  FiTrendingDown,
} from "react-icons/fi";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"]; // Emerald, Amber, Rose
const CENTER_Y = "42%";

interface ChartItem {
  name: string;
  value: number;
}

interface StockOverviewData {
  available: number;
  low_stock: number;
  out_of_stock: number;
  total_stock: number;
  utilization: number;
  stock_alert: number;
  status: string;
  chart: ChartItem[];
}

export default function StockOverview() {
  const [data, setData] = useState<StockOverviewData>({
    available: 0,
    low_stock: 0,
    out_of_stock: 0,
    total_stock: 0,
    utilization: 0,
    stock_alert: 0,
    status: "",
    chart: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/stock-overview/")
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const totalItems = data.chart.reduce((sum, item) => sum + item.value, 0);
  const hasStockData = data.chart.length > 0 && data.chart.some((item) => item.value > 0);
  const isHealthy = data.status.includes("Healthy");

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-blue-600 mb-2" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading Stock...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex flex-col justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4 sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <FiPackage size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Stock Overview</h2>
            <p className="text-[11px] text-slate-400">Live Inventory Status</p>
          </div>
        </div>

        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
          isHealthy ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
        }`}>
          {isHealthy ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
          <span>{data.status}</span>
        </div>
      </div>

      {/* ─── Summary KPIs ───────────────────────────────── */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex flex-col items-center justify-center py-4 px-2 hover:bg-emerald-50/50 transition-colors">
          <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
            <FiCheckCircle size={12} /> Available
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white">{data.available}</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-4 px-2 hover:bg-amber-50/50 transition-colors">
          <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold uppercase tracking-widest text-amber-500">
            <FiAlertTriangle size={12} /> Low Stock
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white">{data.low_stock}</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-4 px-2 hover:bg-rose-50/50 transition-colors">
          <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold uppercase tracking-widest text-rose-500">
            <FiXCircle size={12} /> Out of Stock
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white">{data.out_of_stock}</h3>
        </div>
      </div>

      {/* ─── Chart & Details ────────────────────────────── */}
      <div className="p-5">
        <div className="relative h-[240px]">
          {hasStockData ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.chart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy={CENTER_Y}
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={4}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {data.chart.map((item, index) => (
                      <Cell key={item.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => {
                      const num = Number(value) || 0;
                      return [
                        `${num} (${totalItems > 0 ? ((num / totalItems) * 100).toFixed(1) : "0"}%)`,
                        name,
                      ] as [string, string];
                    }}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9", fontSize: "12px", padding: "8px 12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", fontWeight: 500, color: "#64748b" }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Label */}
              <div
                className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
                style={{ top: CENTER_Y }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</p>
                <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white leading-none mt-0.5">{data.total_stock}</h2>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <FiPackage className="mb-2 text-3xl text-slate-300" />
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">No Stock Data</h3>
              <p className="mt-1 max-w-[200px] text-center text-[11px] text-slate-400">Add products to view inventory overview.</p>
            </div>
          )}
        </div>

        {/* ─── Extra Info Modules ───────────────────────── */}
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* Inventory Utilization */}
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Utilization</p>
              <FiActivity size={14} className="text-blue-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-none">{data.utilization}%</h3>
              <span className="text-[10px] font-medium text-slate-400">of capacity</span>
            </div>
            <div className="mt-2.5 h-[5px] w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  data.utilization >= 80 ? "bg-emerald-500" : "bg-blue-500"
                }`}
                style={{ width: `${Math.max(data.utilization, 5)}%` }}
              />
            </div>
          </div>

          {/* Action Required */}
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 transition-colors hover:bg-amber-50">
            <div className="flex items-center gap-2 mb-1.5">
              <FiAlertTriangle size={14} className="text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Action Required</span>
            </div>
            <h3 className="text-lg font-bold text-amber-700 leading-none mt-1">
              {data.stock_alert} <span className="text-[11px] font-medium">Items</span>
            </h3>
            <p className="mt-1.5 text-[10px] leading-snug text-amber-700/70">
              Low or out of stock. Restock immediately to avoid lost sales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}