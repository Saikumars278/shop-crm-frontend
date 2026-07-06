"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
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
} from "react-icons/fi";

const menu = [
  { name: "Dashboard", href: "/dashboard", icon: FiGrid },
  { name: "Products", href: "/products", icon: FiPackage },
  { name: "Billing", href: "/billing", icon: FiShoppingCart },
  { name: "Sales", href: "/sales", icon: FiTrendingUp },
  { name: "Reports", href: "/reports", icon: FiFileText },
  { name: "Settings", href: "/settings", icon: FiSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (localStorage.getItem("crm_auth") !== "true") {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("crm_auth");
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col bg-slate-900 dark:bg-slate-950 text-white shadow-2xl border-r border-slate-800">

      {/* Logo */}
      <div className="border-b border-slate-800 px-8 py-7">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-blue-600 p-3">
            <FiBox size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide">Shop CRM</h1>
            <p className="text-sm text-slate-400">Inventory &amp; Billing</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Main Menu
        </p>
        <nav className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-300 ${
                  pathname === item.href
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme Toggle */}
      <div className="mx-5 mb-3">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex w-full items-center gap-3 rounded-2xl bg-slate-800 dark:bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
        >
          {theme === "dark" ? <FiSun size={16} className="text-amber-400" /> : <FiMoon size={16} className="text-blue-300" />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* Profile */}
      <div className="m-5 rounded-3xl bg-slate-800 dark:bg-slate-900 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold">
            A
          </div>
          <div>
            <h3 className="font-semibold text-white">Admin</h3>
            <p className="text-sm text-slate-400">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white transition-all hover:bg-red-700 hover:shadow-lg"
        >
          <FiLogOut />
          Logout
        </button>
      </div>

    </aside>
  );
}