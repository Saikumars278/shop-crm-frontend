"use client";

import {
  FiPlusCircle, FiFileText, FiPackage, FiBarChart2,
  FiAlertTriangle, FiDownload, FiRefreshCw, FiSettings,
} from "react-icons/fi";

const actions = [
  { label: "New Bill",        icon: FiFileText,      gradient: "from-blue-500 to-cyan-500",     href: "#" },
  { label: "Add Product",     icon: FiPlusCircle,    gradient: "from-emerald-500 to-green-500", href: "#" },
  { label: "View Inventory",  icon: FiPackage,       gradient: "from-violet-500 to-purple-600", href: "#" },
  { label: "Sales Report",    icon: FiBarChart2,     gradient: "from-orange-500 to-amber-400",  href: "#" },
  { label: "Low Stock Alert", icon: FiAlertTriangle, gradient: "from-red-500 to-pink-500",      href: "#" },
  { label: "Export Data",     icon: FiDownload,      gradient: "from-teal-500 to-cyan-600",     href: "#" },
  { label: "Reorder Stock",   icon: FiRefreshCw,     gradient: "from-indigo-500 to-blue-600",   href: "#" },
  { label: "Settings",        icon: FiSettings,      gradient: "from-slate-500 to-slate-700",   href: "#" },
];

export default function QuickActions() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
      <div className="border-b border-slate-100 dark:border-slate-800 p-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Quick Actions</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Common tasks at your fingertips</p>
      </div>
      <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 dark:border-slate-700 hover:bg-white dark:bg-slate-900 hover:shadow-lg"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${a.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon size={20} />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:text-white">
                {a.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
