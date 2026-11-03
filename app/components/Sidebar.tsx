"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  FiGrid,
  FiPackage,
  FiShoppingCart,
  FiTrendingUp,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiBox,
  FiSun,
  FiMoon,
  FiZap,
  FiMenu,
  FiX,
} from "react-icons/fi";
import QuickActionsModal from "./QuickActionsModal";
import { useSidebar } from "./SidebarContext";

const menu = [
  { name: "Dashboard", href: "/dashboard", icon: FiGrid },
  { name: "AI Forecast", href: "/ai-recommendations", icon: FiZap, badge: "AI" },
  { name: "Products", href: "/products", icon: FiPackage },
  { name: "Billing", href: "/billing", icon: FiShoppingCart },
  { name: "Sales", href: "/sales", icon: FiTrendingUp },
  { name: "Reports", href: "/reports", icon: FiFileText },
  { name: "Settings", href: "/settings", icon: FiSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, close, toggle } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem("crm_auth") !== "true") {
      router.push("/login");
    }
  }, [router]);

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

  const handleLogout = () => {
    localStorage.removeItem("crm_auth");
    router.push("/login");
  };

  return (
    <>
      {/* ─── MOBILE TOP NAVIGATION BAR (Visible on < lg screens) ─── */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 active:scale-95"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/25">
              <FiBox size={18} />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Shop CRM</span>
              <span className="hidden xs:block text-[10px] text-slate-500 dark:text-slate-400">Inventory &amp; Billing</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Actions ERP Button on Mobile */}
          <button
            type="button"
            onClick={() => setIsQuickActionsOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs"
            title="Quick Actions ERP"
          >
            <FiZap size={14} />
            <span className="hidden sm:inline">Actions</span>
          </button>

          {/* Theme Toggle Mobile */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-200 shadow-2xs"
            aria-label="Toggle color theme"
          >
            {isDark ? <FiSun size={15} className="text-amber-400" /> : <FiMoon size={15} className="text-blue-600" />}
          </button>
        </div>
      </header>

      {/* ─── MOBILE BACKDROP OVERLAY ─── */}
      {isOpen && (
        <div
          role="button"
          tabIndex={0}
          onClick={close}
          onKeyDown={(e) => { if (e.key === "Escape") close(); }}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity lg:hidden"
          aria-label="Close navigation overlay"
        />
      )}

      {/* ─── SIDEBAR (Slide-out drawer on mobile, static on desktop) ─── */}
      <aside
        className={`fixed left-0 top-0 flex h-screen w-72 flex-col bg-white/95 dark:bg-slate-950/95 text-slate-800 dark:text-slate-100 shadow-2xl border-r border-slate-200/80 dark:border-slate-800/80 z-50 transition-transform duration-300 ease-in-out backdrop-blur-md ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="border-b border-slate-100 dark:border-slate-800/80 px-6 py-5 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25">
              <FiBox size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Shop CRM</h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Inventory &amp; Billing</p>
            </div>
          </div>

          {/* Close button for mobile screen drawer */}
          <button
            type="button"
            onClick={close}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 lg:hidden"
            aria-label="Close navigation menu"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Navigation - Scrollable area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Quick Actions ERP Button */}
          <div>
            <button
              type="button"
              onClick={() => {
                setIsQuickActionsOpen(true);
                close();
              }}
              className="w-full flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm px-4 py-3 shadow-md shadow-orange-500/20 transition-all duration-200 active:scale-[0.98] group"
            >
              <div className="flex items-center gap-2.5">
                <FiZap size={18} className="transition-transform group-hover:scale-110" />
                <span>Quick Actions</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                ERP
              </span>
            </button>
          </div>

          <div>
            <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Main Menu
            </p>
            <nav className="space-y-1">
              {menu.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href === "/dashboard" && pathname === "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={close}
                    className={`group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/25"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/80 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon size={19} className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-200"}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xs"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Controls & User Profile Section */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 p-4 space-y-3 shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
          
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex w-full items-center justify-between rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              {isDark ? <FiSun size={16} className="text-amber-400" /> : <FiMoon size={16} className="text-blue-600" />}
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {isDark ? "Dark" : "Light"}
            </span>
          </button>

          {/* User Card & Compact Logout */}
          <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-sm">
                A
              </div>
              <div className="overflow-hidden">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">Admin User</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Administrator</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors active:scale-95"
            >
              <FiLogOut size={15} />
            </button>
          </div>

        </div>

      </aside>

      {/* Render ERP Quick Actions Modal */}
      <QuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
      />
    </>
  );
}
