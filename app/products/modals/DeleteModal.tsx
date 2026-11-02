"use client";

import { FiX, FiAlertTriangle } from "react-icons/fi";
import type { Product } from "../ProductTable";

type DeleteProductModalProps = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onDelete: () => void;
};

export default function DeleteProductModal({
  open,
  product,
  onClose,
  onDelete,
}: DeleteProductModalProps) {
  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-100 p-2.5">
              <FiAlertTriangle className="text-xl text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Delete Product
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-300"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-slate-600 dark:text-slate-300">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-800 dark:text-white">
              {product.name}
            </span>{" "}
            <span className="text-slate-400">({product.id})</span>? This
            action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-2.5 font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            Delete Product
          </button>
        </div>
      </div>
    </div>
  );
}