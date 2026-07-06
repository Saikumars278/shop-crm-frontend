"use client";

import { useEffect, useState } from "react";
import {
  FiPackage,
  FiPlus,
  FiDownload,
  FiChevronRight,
} from "react-icons/fi";

import AddProductModal from "./modals/AddProductModal";
import type { Product } from "./ProductTable";

interface HeaderData {
  total_products: number;
  next_id: string;
}

type ProductHeaderProps = {
  onAddProduct?: (product: Product) => void;
};

export default function ProductHeader({
  onAddProduct,
}: ProductHeaderProps) {
  const [showAdd, setShowAdd] = useState(false);

  const [headerData, setHeaderData] = useState<HeaderData>({
    total_products: 0,
    next_id: "PRD001",
  });

  const loadHeader = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/products/header/"
      );

      if (!response.ok) {
        throw new Error("Failed to load header");
      }

      const data = await response.json();

      setHeaderData(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadHeader();
  }, []);

  const handleAdd = (product: Product) => {
    onAddProduct?.(product);

    setShowAdd(false);

    loadHeader();
  };

  const handleExport = () => {
    window.open(
      "http://127.0.0.1:8000/api/products/export/",
      "_blank"
    );
  };

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">

        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Left Side */}

          <div>

            <div className="mb-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">

              <span>Dashboard</span>

              <FiChevronRight size={14} />

              <span className="font-semibold text-blue-600">
                Products
              </span>

            </div>

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">

                <FiPackage
                  size={20}
                  className="text-blue-600"
                />

              </div>

              <div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Products
                </h1>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Manage inventory, stock levels and product details.
                </p>

              </div>

            </div>

          </div>

          {/* Right Side */}

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">

            <div className="flex flex-col justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2">

              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Products
              </p>

              <h3 className="mt-0.5 text-xl font-bold leading-none text-slate-900 dark:text-white">
                {headerData.total_products}
              </h3>

            </div>

            <button
              type="button"
              onClick={handleExport}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100"
            >
              <FiDownload size={14} />
              Export
            </button>

            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <FiPlus size={14} />
              Add Product
            </button>

          </div>

        </div>

      </section>

      <AddProductModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        nextId={headerData.next_id}
        onAdd={handleAdd}
      />
    </>
  );
}