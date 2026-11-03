"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiCalendar,
  FiClock,
  FiSearch,
  FiSettings,
  FiUser,
  FiMenu,
} from "react-icons/fi";
import { useSidebar } from "./SidebarContext";

export default function Header() {
  const [time, setTime] = useState("");
  const { toggle } = useSidebar();

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const hour = new Date().getHours();

  let greeting = "Good Morning";

  if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
  if (hour >= 17) greeting = "Good Evening";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 mb-4 sm:mb-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm transition-all duration-300 w-full min-w-0">
      <div className="flex flex-col gap-3 sm:gap-4 p-3.5 sm:p-5 lg:flex-row lg:items-center lg:justify-between w-full min-w-0">
        {/* Left Info & Mobile Toggle */}
        <div className="flex items-start justify-between sm:justify-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 px-3 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                {greeting}
              </span>
            </div>
            <h1 className="mt-1.5 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Admin Dashboard
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <FiCalendar className="text-blue-500" size={13} />
                <span>{today}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiClock className="text-emerald-500" size={13} />
                <span>{time}</span>
              </div>
            </div>
          </div>

          {/* Quick Menu Button on mobile if needed */}
          <button
            type="button"
            onClick={toggle}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 lg:hidden"
            aria-label="Open Navigation"
          >
            <FiMenu size={18} />
          </button>
        </div>

        {/* Right Search & Controls */}
        <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 min-w-0">
          {/* Search Input */}
          <div className="flex w-full sm:max-w-xs md:max-w-sm items-center rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/90 px-3 py-2 transition-all duration-200 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/20 shadow-inner">
            <FiSearch size={15} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search products, bills..."
              className="ml-2 w-full bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            {/* Quick Settings Link */}
            <Link 
              href="/settings"
              title="Settings"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-xs transition hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95"
            >
              <FiSettings size={16} />
            </Link>

            {/* Profile Badge */}
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-2.5 py-1.5 shadow-xs transition hover:shadow-md">
              <div className="relative">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-xs">
                  <FiUser size={13} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white dark:border-slate-900 bg-emerald-500"></span>
              </div>
              <div className="block">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Admin</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">System</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
