"use client";

import {
  FiPlusCircle, FiFileText, FiPackage, FiBarChart2,
  FiAlertTriangle, FiDownload, FiRefreshCw, FiSettings, FiZap
} from "react-icons/fi";

const actions = [
  { label: "New Bill",        icon: FiFileText,      gradient: "from-blue-500 to-cyan-500",     href: "/billing" },
  { label: "Add Product",     icon: FiPlusCircle,    gradient: "from-emerald-500 to-green-500", href: "/products" },
  { label: "View Inventory",  icon: FiPackage,       gradient: "from-violet-500 to-purple-600", href: "/products" },
  { label: "Sales Report",    icon: FiBarChart2,     gradient: "from-orange-500 to-amber-400",  href: "/reports" },
  { label: "Low Stock Alert", icon: FiAlertTriangle, gradient: "from-red-500 to-pink-500",      href: "/products" },
  { label: "Export Data",     icon: FiDownload,      gradient: "from-teal-500 to-cyan-600",     href: "/reports" },
  { label: "Reorder Stock",   icon: FiRefreshCw,     gradient: "from-indigo-500 to-blue-600",   href: "/products" },
  { label: "Settings",        icon: FiSettings,      gradient: "from-slate-500 to-slate-700",   href: "/settings" },
];

export default function QuickActions() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm h-full">
      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm">
            <FiZap size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Quick Actions</h2>
            <p className="text-[11px] text-slate-400">Common tasks & operations</p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-400">
          8 Shortcuts
        </span>
      </div>

      {/* ─── Action Grid ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4 flex-1 items-center">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <a
              key={a.label}
              href={a.href}
              className="group flex flex-col items-center justify-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r ${a.gradient} text-white shadow-sm transition-transform duration-200 group-hover:scale-105`}
              >
                <Icon size={18} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {a.label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
