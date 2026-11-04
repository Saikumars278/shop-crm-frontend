"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  FiCalendar,
  FiDownload,
  FiSearch,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiTrendingUp,
  FiFileText,
  FiDollarSign,
  FiPieChart,
  FiCreditCard,
  FiSmartphone,
  FiBriefcase,
  FiShoppingBag,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import { API_BASE } from "@/app/lib/api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const PAGE_SIZE = 8;

export default function SalesPage() {
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("Last 7 Days");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [paymentData, setPaymentData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [salesList, setSalesList] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/sales/page-data/`)
      .then((res) => res.json())
      .then((data) => {
        setRevenueData(data.revenue_data || []);
        setPaymentData(data.payment_data || []);
        setTopProducts(data.top_products || []);
        setSalesList(data.sales_list || []);
      })
      .catch((err) => {
        console.error("Failed to load sales data:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Compute date range from the selected filter
  function getDateRange(): { from: string; to: string } | null {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    if (dateFilter === "Today") {
      return { from: fmt(today), to: fmt(today) };
    }
    if (dateFilter === "Yesterday") {
      const y = new Date(today); y.setDate(y.getDate() - 1);
      return { from: fmt(y), to: fmt(y) };
    }
    if (dateFilter === "Last 7 Days") {
      const from = new Date(today); from.setDate(from.getDate() - 6);
      return { from: fmt(from), to: fmt(today) };
    }
    if (dateFilter === "This Month") {
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: fmt(from), to: fmt(today) };
    }
    return null;
  }

  // Filter Sales by date range + search query
  const filteredSales = useMemo(() => {
    let filtered = salesList;
    const range = getDateRange();
    if (range) {
      filtered = filtered.filter(
        (s) => s.date >= range.from && s.date <= range.to
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (s) => s.id.toLowerCase().includes(q) || s.status.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [query, salesList, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / PAGE_SIZE));
  const paginatedSales = filteredSales.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalRevenue = salesList.reduce((sum, s) => sum + (s.total || 0), 0);
  const estimatedProfit = totalRevenue * 0.15;
  const todaySales = salesList
    .filter((s) => s.date === new Date().toISOString().split("T")[0])
    .reduce((sum, s) => sum + (s.total || 0), 0);

  return (
    <div className="min-h-screen p-3 sm:p-5 lg:p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto w-full space-y-4 min-w-0">
        
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Sales Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track revenue, transactions, and performance metrics.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 px-3 py-2 shadow-sm border border-slate-200 dark:border-slate-700">
              <FiCalendar size={14} className="text-slate-400" />
              <select 
                className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              >
                <option>Today</option>
                <option>Yesterday</option>
                <option>Last 7 Days</option>
                <option>This Month</option>
                <option>Custom Range...</option>
              </select>
            </div>
            
            <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95">
              <FiDownload size={14} />
              Export Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-2xl bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800"
              >
                <div className="h-10 w-10 rounded-xl youtube-shimmer shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-3 w-20 rounded-md youtube-shimmer" />
                  <div className="h-6 w-28 rounded-md youtube-shimmer" />
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-2xl bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 transition hover:shadow-md">
                <div className="rounded-xl bg-blue-50 dark:bg-blue-950/60 p-2.5 text-blue-600 dark:text-blue-400">
                  <FiDollarSign className="text-lg" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Today's Sales</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">{formatINR(todaySales)}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-2xl bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 transition hover:shadow-md">
                <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/60 p-2.5 text-indigo-600 dark:text-indigo-400">
                  <FiFileText className="text-lg" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Bills</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">{salesList.length}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-2xl bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 transition hover:shadow-md">
                <div className="rounded-xl bg-green-50 dark:bg-green-950/60 p-2.5 text-green-600 dark:text-green-400">
                  <FiTrendingUp className="text-lg" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Revenue</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">{formatINR(totalRevenue)}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-2xl bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 transition hover:shadow-md">
                <div className="rounded-xl bg-orange-50 dark:bg-orange-950/60 p-2.5 text-orange-600 dark:text-orange-400">
                  <FiPieChart className="text-lg" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Estimated Profit (15%)</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">{formatINR(estimatedProfit)}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="col-span-1 lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Revenue Trend</h3>
            <div className="h-60 w-full min-w-0">
              {loading ? (
                <div className="h-full w-full rounded-xl youtube-shimmer relative overflow-hidden flex items-end p-4">
                  <div className="w-full flex justify-between items-end gap-3">
                    {[30, 55, 45, 80, 60, 90, 75].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-md bg-white/40 dark:bg-slate-700/40" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              ) : revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#215CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#215CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={(val) => `₹${val/1000}k`} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.15)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', backgroundColor: '#0f172a', color: '#f8fafc' }}
                      itemStyle={{ color: '#f8fafc' }}
                      formatter={(value) => [formatINR(Number(value) || 0), "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#215CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <FiDollarSign className="text-slate-300 dark:text-slate-600 mb-2" size={28} />
                  <p className="text-xs font-semibold text-slate-500">No Revenue Trend Data Available</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="col-span-1 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Payment Methods</h3>
              <div className="h-44 w-full min-w-0">
                {loading ? (
                  <div className="h-full w-full rounded-xl youtube-shimmer flex flex-col justify-around p-3">
                    <div className="h-4 w-3/4 rounded-md bg-white/40 dark:bg-slate-700/40" />
                    <div className="h-4 w-1/2 rounded-md bg-white/40 dark:bg-slate-700/40" />
                    <div className="h-4 w-2/3 rounded-md bg-white/40 dark:bg-slate-700/40" />
                  </div>
                ) : paymentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.15)" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontWeight: 600 }} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} 
                        contentStyle={{ borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.15)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', backgroundColor: '#0f172a', color: '#f8fafc' }} 
                        itemStyle={{ color: '#f8fafc' }}
                        formatter={(val) => formatINR(Number(val) || 0)} 
                      />
                      <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <FiCreditCard className="text-slate-300 dark:text-slate-600 mb-2" size={24} />
                    <p className="text-xs font-semibold text-slate-500">No Payment Data</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-around border-t border-slate-100 dark:border-slate-800 pt-3">
               <div className="text-center w-full">
                 <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Sales Value</p>
                 <div className="text-lg font-bold text-[#215CF6] mt-0.5">
                   {loading ? <div className="h-6 w-24 rounded-md youtube-shimmer mx-auto" /> : formatINR(totalRevenue)}
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Top Products & Table */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          
          {/* Top Products List */}
          <div className="col-span-1 lg:col-span-1 flex flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Top Selling Products</h3>
            </div>
            <div className="p-3 space-y-3 flex-1">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-6 w-6 rounded-md youtube-shimmer shrink-0" />
                      <div className="space-y-1">
                        <div className="h-3.5 w-24 rounded-md youtube-shimmer" />
                        <div className="h-2.5 w-16 rounded-md youtube-shimmer" />
                      </div>
                    </div>
                  </div>
                ))
              ) : topProducts.length > 0 ? (
                topProducts.map((p, i) => (
                  <div key={p.id || i} className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/60 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-slate-800 dark:text-white line-clamp-1">{p.name}</p>
                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{p.sold} units sold</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">No top products recorded</div>
              )}
            </div>
          </div>

          {/* Sales Table */}
          <div className="col-span-1 lg:col-span-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Recent Transactions</h3>
              <div className="relative w-full sm:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search by Bill ID..." 
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 pl-8 pr-3 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex-1 crm-table-container">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase tracking-widest text-slate-400">
                    <th className="px-4 py-2.5 font-bold">Bill ID</th>
                    <th className="px-4 py-2.5 font-bold">Date</th>
                    <th className="px-4 py-2.5 font-bold">Items</th>
                    <th className="px-4 py-2.5 font-bold">Total</th>
                    <th className="px-4 py-2.5 font-bold">Payment</th>
                    <th className="px-4 py-2.5 font-bold">Status</th>
                    <th className="px-4 py-2.5 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[12px]">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-100 dark:border-slate-800/60">
                        <td className="px-4 py-3"><div className="h-3.5 w-16 rounded-md youtube-shimmer" /></td>
                        <td className="px-4 py-3"><div className="h-3 w-20 rounded-md youtube-shimmer" /></td>
                        <td className="px-4 py-3"><div className="h-3 w-12 rounded-md youtube-shimmer" /></td>
                        <td className="px-4 py-3"><div className="h-3.5 w-20 rounded-md youtube-shimmer" /></td>
                        <td className="px-4 py-3"><div className="h-3 w-14 rounded-md youtube-shimmer" /></td>
                        <td className="px-4 py-3"><div className="h-4 w-14 rounded-full youtube-shimmer" /></td>
                        <td className="px-4 py-3 text-center"><div className="h-6 w-6 rounded-lg youtube-shimmer mx-auto" /></td>
                      </tr>
                    ))
                  ) : paginatedSales.length > 0 ? (
                    paginatedSales.map((sale) => (
                      <tr key={sale.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <td className="px-4 py-2.5 font-semibold text-blue-600 dark:text-blue-400">{sale.id}</td>
                        <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300 font-medium">{sale.date}</td>
                        <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{sale.items}</td>
                        <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-white tabular-nums">{formatINR(sale.total)}</td>
                        <td className="px-4 py-2.5">
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                            {sale.payment === "Cash" && <FiBriefcase className="text-blue-500" size={12} />}
                            {sale.payment === "Card" && <FiCreditCard className="text-green-500" size={12} />}
                            {sale.payment === "UPI" && <FiSmartphone className="text-orange-500" size={12} />}
                            {sale.payment}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                            sale.status === 'Paid' || sale.status === 'Completed'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          }`}>
                            {sale.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-center gap-1.5">
                             <button 
                               onClick={() => setSelectedSale(sale)}
                               className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition hover:bg-blue-100 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400" 
                               title="View"
                             >
                               <FiEye size={12} />
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        No transactions recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-4 py-3 bg-white dark:bg-slate-900">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Page <span className="font-bold text-slate-800 dark:text-white">{currentPage}</span> of {totalPages}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800 disabled:opacity-50"
                  >
                    <FiChevronLeft />
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800 disabled:opacity-50"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* View Bill Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Bill Details</h2>
              <button 
                onClick={() => setSelectedSale(null)}
                className="text-slate-400 hover:text-slate-700 dark:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Bill ID:</span>
                <span className="font-semibold text-slate-800 dark:text-white">{selectedSale.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Date:</span>
                <span className="font-medium text-slate-800 dark:text-white">{selectedSale.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Cashier:</span>
                <span className="font-medium text-slate-800 dark:text-white">{selectedSale.cashier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total Items:</span>
                <span className="font-medium text-slate-800 dark:text-white">{selectedSale.items}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Payment Mode:</span>
                <span className="font-medium text-slate-800 dark:text-white">{selectedSale.payment}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                <span className="font-bold text-slate-800 dark:text-white">Grand Total:</span>
                <span className="text-xl font-black text-blue-600">{formatINR(selectedSale.total)}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setSelectedSale(null)}
                className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3 font-bold text-slate-700 dark:text-slate-200 transition hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
