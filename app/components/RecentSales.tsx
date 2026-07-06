"use client";

import { useEffect, useState } from "react";
import {
  FiShoppingBag,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiSearch,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiFilter
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
  pagination: {
    current_page: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export default function RecentSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<ApiResponse["summary"] | null>(null);
  const [pagination, setPagination] = useState<ApiResponse["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [page, setPage] = useState(1);

  // Which bill's full product list is expanded (bill id, or null if none)
  const [expandedBill, setExpandedBill] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1); // reset to page 1 on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/dashboard/recent-sales/?search=${searchQuery}&sort=${sort}&page=${page}`)
      .then((res) => res.json())
      .then((data: ApiResponse) => {
        setSales(data.sales);
        setSummary(data.summary);
        setPagination(data.pagination);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [searchQuery, sort, page]);

  const toggleExpand = (billId: string) => {
    setExpandedBill((prev) => (prev === billId ? null : billId));
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Recent Grocery Bills</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Grocery Transactions &amp; Insights</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input
              type="text"
              placeholder="Search bills..."
              className="w-32 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 pl-7 pr-3 text-[11px] outline-none transition focus:border-blue-500 focus:bg-white dark:bg-slate-900 focus:ring-1 focus:ring-blue-500"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <select
              className="appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 pl-7 pr-5 text-[11px] outline-none transition focus:border-blue-500 focus:bg-white dark:bg-slate-900 focus:ring-1 focus:ring-blue-500"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="date_desc">Newest</option>
              <option value="date_asc">Oldest</option>
              <option value="amount_desc">High Amount</option>
              <option value="amount_asc">Low Amount</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards — only when bills exist */}
      {summary && summary.total_bills > 0 && (
        <div className="grid grid-cols-2 gap-3 border-b border-slate-100 dark:border-slate-800 p-4">
          <div className="group rounded-2xl bg-blue-50 p-3 transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-transform group-hover:scale-110">
                <FiFileText size={13} />
              </div>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Total Bills</span>
            </div>
            <h3 className="mt-2 text-xl font-bold text-slate-800 dark:text-white">{summary.total_bills}</h3>
          </div>
          <div className="group rounded-2xl bg-green-50 p-3 transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-600 transition-transform group-hover:scale-110">
                <FiTrendingUp size={13} />
              </div>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Total Revenue</span>
            </div>
            <h3 className="mt-2 text-xl font-bold text-green-600">₹{Number(summary.total_revenue).toLocaleString("en-IN")}</h3>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Bill No.</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Grocery Items</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Qty</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date & Time</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Payment</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody className={loading ? "opacity-50" : ""}>
            {sales.map((sale) => {
              const isExpanded = expandedBill === sale.id;
              const hasMultipleItems = sale.items && sale.items.length > 1;

              return (
                <tr key={sale.id} className="border-b border-slate-100 dark:border-slate-800 transition hover:bg-slate-50 dark:bg-slate-800 align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-xs font-bold text-slate-800 dark:text-white">{sale.id}</td>

                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-100">
                        <FiShoppingBag className="text-green-600" size={14} />
                      </div>
                      <div className="min-w-0">
                        {isExpanded && sale.items && sale.items.length > 0 ? (
                          <ul className="space-y-0.5">
                            {sale.items.map((item, idx) => (
                              <li key={idx} className="flex items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-200">
                                <span className="truncate">{item.name}</span>
                                <span className="shrink-0 text-slate-400">
                                  x{item.qty} · ₹{Number(item.price).toLocaleString("en-IN")}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <h4 className="text-xs font-semibold text-slate-800 dark:text-white truncate">{sale.product}</h4>
                        )}

                        {hasMultipleItems && (
                          <button
                            onClick={() => toggleExpand(sale.id)}
                            className="mt-1 text-[10px] font-medium text-blue-600 hover:underline"
                          >
                            {isExpanded ? "Show less" : "View all items"}
                          </button>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-200">{sale.qty}</td>

                  <td className="whitespace-nowrap px-4 py-3 text-center text-xs font-bold text-slate-900 dark:text-white">
                    ₹{Number(sale.amount).toLocaleString("en-IN")}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="text-xs font-semibold text-slate-800 dark:text-white">{sale.date}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{sale.time}</div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-center text-xs font-medium text-slate-700 dark:text-slate-200">
                    {sale.payment_method}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    {sale.status === "Paid" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                        <FiCheckCircle size={10} /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-[10px] font-semibold text-yellow-700">
                        <FiClock size={10} /> Pending
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {sales.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FiShoppingBag size={32} className="opacity-30" />
                    <p className="text-xs font-medium">No matching grocery bills found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination — only when more than 1 page */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page <span className="font-semibold text-slate-700 dark:text-slate-200">{pagination.current_page}</span> of{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{pagination.total_pages}</span>
            {summary && <span className="ml-2 text-slate-400">({summary.total_bills} bills)</span>}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.has_prev}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:bg-slate-800 disabled:opacity-40"
            >
              <FiChevronLeft size={13} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
              disabled={!pagination.has_next}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:bg-slate-800 disabled:opacity-40"
            >
              Next <FiChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}