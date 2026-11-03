"use client";
import { API_BASE } from "@/app/lib/api";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiZap,
  FiX,
  FiFileText,
  FiPlusCircle,
  FiPackage,
  FiBarChart2,
  FiAlertTriangle,
  FiRefreshCw,
  FiDownload,
  FiSettings,
  FiArrowRight,
} from "react-icons/fi";

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ActionItem {
  id: string;
  title: string;
  desc: string;
  icon: any;
  gradient: string;
  href: string;
  badge?: string;
  badgeColor?: string;
}

export default function QuickActionsModal({ isOpen, onClose }: QuickActionsModalProps) {
  const [lowStockCount, setLowStockCount] = useState<number>(3);

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_BASE}/stock-overview/`)
        .then((r) => r.json())
        .then((data) => {
          if (typeof data?.low_stock === "number") {
            setLowStockCount(data.low_stock);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions: ActionItem[] = [
    {
      id: "bill",
      title: "New Bill",
      desc: "Create a customer checkout bill & print receipt",
      icon: FiFileText,
      gradient: "from-blue-500 to-indigo-600",
      href: "/billing",
      badge: "Quick POS",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-900",
    },
    {
      id: "add-product",
      title: "Add Product",
      desc: "Add new item with barcode, price & stock quantity",
      icon: FiPlusCircle,
      gradient: "from-emerald-500 to-teal-600",
      href: "/products",
    },
    {
      id: "inventory",
      title: "View Inventory",
      desc: "Check stock levels, categories & catalog stats",
      icon: FiPackage,
      gradient: "from-violet-500 to-purple-600",
      href: "/products",
    },
    {
      id: "reports",
      title: "Sales Report",
      desc: "Analyze revenue trends, margins & top items",
      icon: FiBarChart2,
      gradient: "from-amber-500 to-orange-500",
      href: "/reports",
    },
    {
      id: "low-stock",
      title: "Low Stock Alert",
      desc: "Review products below minimum stock threshold",
      icon: FiAlertTriangle,
      gradient: "from-rose-500 to-red-600",
      href: "/products",
      badge: `${lowStockCount} Low Stock`,
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900",
    },
    {
      id: "reorder",
      title: "Reorder Stock",
      desc: "Restock out-of-stock items & place vendor POs",
      icon: FiRefreshCw,
      gradient: "from-indigo-500 to-blue-600",
      href: "/products",
    },
    {
      id: "export",
      title: "Export Data",
      desc: "Download inventory logs & sales Excel reports",
      icon: FiDownload,
      gradient: "from-teal-500 to-cyan-600",
      href: "/reports",
    },
    {
      id: "settings",
      title: "Settings",
      desc: "Configure store info, tax rates & preferences",
      icon: FiSettings,
      gradient: "from-slate-600 to-slate-800",
      href: "/settings",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* ─── Backdrop (click outside to close) ─── */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* ─── Centered ERP Modal ─── */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition-all duration-200 z-10 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md">
              <FiZap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  ⚡ Quick Actions
                </h2>
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                  ERP Shortcuts
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Execute common shop operations instantly
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Close (ESC)"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Modal Body: 2-Column Action Grid */}
        <div className="p-5 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {actions.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className="group relative flex items-start gap-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md"
                >
                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r ${item.gradient} text-white shadow-sm transition-transform duration-200 group-hover:scale-105`}
                  >
                    <Icon size={18} />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {item.title}
                      </h3>
                      {item.badge && (
                        <span
                          className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-extrabold border ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                      {item.desc}
                    </p>
                  </div>

                  {/* Arrow Indicator */}
                  <FiArrowRight
                    size={13}
                    className="shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all self-center"
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 px-6 py-3 flex items-center justify-between text-[11px] text-slate-400">
          <span>Press <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">ESC</kbd> to exit</span>
          <span>Shop CRM ERP Suite</span>
        </div>
      </div>
    </div>
  );
}
