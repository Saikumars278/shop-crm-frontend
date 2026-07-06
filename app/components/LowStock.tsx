"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiAlertTriangle,
  FiPackage,
  FiArrowRight,
  FiTrendingDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

interface LowStockProduct {
  id: number;
  name: string;
  category: string;
  stock: number;
  status: string;
  unit: string;
  sell_price: number;
  buy_price: number;
  suggested_restock: number;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface ApiResponse {
  total: number;
  critical: number;
  products: LowStockProduct[];
  pagination: Pagination;
}

export default function LowStock() {
  const router = useRouter();
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);

  // Tracks table height so it doesn't collapse/jump between pages
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const [minHeight, setMinHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    if (page === 1 && lowStockProducts.length === 0) {
      setInitialLoading(true);
    } else {
      setPageLoading(true);
      // lock current height before fetching so the fade doesn't shake the layout
      if (tableWrapRef.current) {
        setMinHeight(tableWrapRef.current.offsetHeight);
      }
    }

    fetch(`http://127.0.0.1:8000/api/dashboard/low-stock/?page=${page}`)
      .then((res) => res.json())
      .then((data: ApiResponse) => {
        if (cancelled) return;
        setLowStockProducts(data.products);
        setTotal(data.total);
        setCriticalCount(data.critical);
        setPagination(data.pagination);
      })
      .catch((err) => {
        if (!cancelled) console.error(err);
      })
      .finally(() => {
        if (cancelled) return;
        setInitialLoading(false);
        setPageLoading(false);
        // release the locked height once new content has rendered
        requestAnimationFrame(() => setMinHeight(undefined));
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const goToPage = (next: number) => {
    if (pageLoading || next === page) return;
    setPage(next);
  };

  if (initialLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center text-sm shadow-lg">
        Loading...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
            <FiAlertTriangle className="text-lg text-red-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Low Stock Products</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Inventory requiring immediate attention</p>
          </div>
        </div>
        <button 
          onClick={() => router.push('/products')}
          className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
        >
          View All
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 border-b border-slate-100 dark:border-slate-800 p-4">
        <div className="rounded-2xl bg-red-50 p-3.5">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Low Stock Items</p>
          <h2 className="mt-1 text-xl font-bold text-red-600">{total}</h2>
        </div>
        <div className="rounded-2xl bg-orange-50 p-3.5">
          <div className="flex items-center gap-1.5">
            <FiTrendingDown className="text-orange-600" size={12} />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Critical Items</span>
          </div>
          <h2 className="mt-1 text-xl font-bold text-orange-600">{criticalCount}</h2>
        </div>
      </div>

      {/* Table */}
      <div
        ref={tableWrapRef}
        style={minHeight ? { minHeight: `${minHeight}px` } : undefined}
        className="relative overflow-x-auto"
      >
        <table
          className={`min-w-full transition-opacity duration-300 ease-out ${
            pageLoading ? "opacity-40" : "opacity-100"
          }`}
        >
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Product</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Category</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Price (Buy / Sell)</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Stock</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Suggested Restock</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => {
                const stockPercent = Math.min(product.stock * 10, 100);
                return (
                  <tr key={product.id} className="border-b border-slate-100 dark:border-slate-800 transition hover:bg-slate-50 dark:bg-slate-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                          <FiPackage className="text-blue-600" size={15} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-xs font-semibold text-slate-800 dark:text-white">{product.name}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">ID #{product.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{product.category}</td>

                    <td className="px-4 py-3 text-center">
                      <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        ₹{product.buy_price.toLocaleString("en-IN")}
                      </p>
                      <p className="font-mono text-xs font-semibold text-slate-800 dark:text-white">
                        ₹{product.sell_price.toLocaleString("en-IN")}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-red-600">
                          {product.stock} {product.unit}
                        </span>
                        <div className="mt-1.5 h-1.5 w-20 rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full ${product.status === "Critical" ? "bg-red-500" : "bg-yellow-500"}`}
                            style={{ width: `${stockPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                        +{product.suggested_restock} {product.unit}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${product.status === "Critical" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {product.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => router.push('/products')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-200 transition hover:bg-blue-600 hover:text-white"
                      >
                        Restock
                        <FiArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                  No Low Stock Products
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* small centered spinner overlay instead of layout-shifting loader */}
        {pageLoading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-blue-600" />
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page <span className="font-semibold text-slate-700 dark:text-slate-200">{pagination.current_page}</span> of{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{pagination.total_pages}</span>
            <span className="ml-2 text-slate-400">({total} items)</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={!pagination.has_prev || pageLoading}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiChevronLeft size={13} /> Prev
            </button>
            <button
              onClick={() => goToPage(Math.min(pagination.total_pages, page + 1))}
              disabled={!pagination.has_next || pageLoading}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <FiChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}