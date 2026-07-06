"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FiSearch,
  FiPlus,
  FiDownload,
  FiFilter,
  FiX,
} from "react-icons/fi";

import AddProductModal from "./modals/AddProductModal";
import type { Product } from "./ProductTable";

export type SortOption =
  | "Newest First"
  | "Oldest First"
  | "Name A-Z"
  | "Stock High-Low"
  | "Price High-Low";

export type StatusFilter = "All Status" | Product["status"];

type ProductFiltersProps = {
  categories?: string[];
  nextId?: string;
  onAddProduct?: (product: Product) => void;
  onExport?: () => void;

  // Returns filtered products to parent
  onProductsChange?: (
    products: Product[],
    categories: string[]
  ) => void;
};

const API = "http://127.0.0.1:8000/api/products/";

const DEFAULT_CATEGORIES = [
  "Accessories",
  "Storage",
  "Monitor",
  "Printer",
  "Laptop",
];

const STATUS_OPTIONS: StatusFilter[] = [
  "All Status",
  "In Stock",
  "Low Stock",
  "Out of Stock",
];

const SORT_OPTIONS: SortOption[] = [
  "Newest First",
  "Oldest First",
  "Name A-Z",
  "Stock High-Low",
  "Price High-Low",
];

const DEFAULT_CATEGORY = "All Categories";
const DEFAULT_STATUS: StatusFilter = "All Status";
const DEFAULT_SORT: SortOption = "Newest First";

export default function ProductFilters({
  categories = DEFAULT_CATEGORIES,
  nextId = "PRD001",
  onAddProduct,
  onExport,
  onProductsChange,
}: ProductFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [showAdd, setShowAdd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [status, setStatus] = useState<StatusFilter>(DEFAULT_STATUS);
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);

  // Sync state with URL search params when they change externally
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam && STATUS_OPTIONS.includes(statusParam as StatusFilter)) {
      setStatus(statusParam as StatusFilter);
    } else if (!statusParam) {
      setStatus(DEFAULT_STATUS);
    }
  }, [searchParams]);

  const loadProducts = async () => {
    try {
      const params = new URLSearchParams();

      if (search)
        params.append("search", search);

      if (category !== DEFAULT_CATEGORY)
        params.append("category", category);

      if (status !== DEFAULT_STATUS)
        params.append("status", status);

      params.append("sort", sort);

      const response = await fetch(
        `${API}?${params.toString()}`
      );

      const data = await response.json();

      onProductsChange?.(
        data.products,
        data.categories
      );
    } catch (error) {
      console.error("Error loading products", error);
    }
  };

  // Filtering is automatic: any change to search, category, status,
  // or sort re-triggers the fetch without needing a submit/apply button.
  useEffect(() => {
    loadProducts();
  }, [search, category, status, sort]);

  const handleAdd = (product: Product) => {
    onAddProduct?.(product);
    setShowAdd(false);

    loadProducts();
  };

  const updateStatus = (newStatus: StatusFilter) => {
    setStatus(newStatus);
    // Also update the URL so it's shareable and consistent
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus === DEFAULT_STATUS) {
      params.delete("status");
    } else {
      params.set("status", newStatus);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategory(DEFAULT_CATEGORY);
    setSort(DEFAULT_SORT);
    updateStatus(DEFAULT_STATUS);
  };

  const activeFilterCount =
    (category !== DEFAULT_CATEGORY ? 1 : 0) +
    (status !== DEFAULT_STATUS ? 1 : 0);

  const hasAnyFilterOrSearch =
    activeFilterCount > 0 ||
    search.trim().length > 0 ||
    sort !== DEFAULT_SORT;

  return (
    <>
      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

          <div className="flex flex-1 flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search Product..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm transition focus:border-blue-500 outline-none"
            >
              <option>{DEFAULT_CATEGORY}</option>

              {categories.map((c) => (
                <option key={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) =>
                updateStatus(e.target.value as StatusFilter)
              }
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm transition focus:border-blue-500 outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) =>
                setSort(
                  e.target.value as SortOption
                )
              }
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm transition focus:border-blue-500 outline-none"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">

            <button
              onClick={() =>
                setShowFilters(!showFilters)
              }
              className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm transition hover:bg-slate-50 dark:bg-slate-800"
            >
              <FiFilter size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {hasAnyFilterOrSearch && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
              >
                <FiX size={14} />
                Clear
              </button>
            )}

            <button
              onClick={onExport}
              className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm transition hover:bg-slate-50 dark:bg-slate-800"
            >
              <FiDownload size={14} />
              Export
            </button>

            <button
              onClick={() =>
                setShowAdd(true)
              }
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white shadow-sm transition hover:bg-blue-700"
            >
              <FiPlus size={14} />
              Add Product
            </button>

          </div>
        </div>

        {showFilters && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-600 dark:text-slate-300">
            <div>
              <b>Active Filters:</b>

              {activeFilterCount === 0
                ? " None"
                : (
                  <>
                    {category !==
                      DEFAULT_CATEGORY &&
                      ` Category: ${category}`}

                    {status !==
                      DEFAULT_STATUS &&
                      ` | Status: ${status}`}
                  </>
                )}
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-red-600 hover:underline"
              >
                <FiX />
                Clear all
              </button>
            )}
          </div>
        )}
      </section>

      <AddProductModal
        open={showAdd}
        onClose={() =>
          setShowAdd(false)
        }
        nextId={nextId}
        onAdd={handleAdd}
      />
    </>
  );
}