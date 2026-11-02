"use client";

import { useEffect, useState } from "react";

import {
  FiCalendar,
  FiClock,
  FiSearch,
  FiSettings,
  FiUser,
} from "react-icons/fi";

export default function Header() {
  const [time, setTime] = useState("");

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
    <header className="sticky top-0 z-20 mb-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Info */}
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 px-3.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              {greeting}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <FiCalendar className="text-blue-500" size={14} />
              <span>{today}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiClock className="text-emerald-500" size={14} />
              <span>{time}</span>
            </div>
          </div>
        </div>

        {/* Right Search & Controls */}
        <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
          {/* Search Input */}
          <div className="flex w-full max-w-md items-center rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/90 px-3.5 py-2.5 transition-all duration-200 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/20 shadow-inner">
            <FiSearch size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search products, invoices, customers..."
              className="ml-2.5 w-full bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Quick Settings Link */}
          <a 
            href="/settings"
            title="Settings"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95"
          >
            <FiSettings size={17} />
          </a>

          {/* Profile Badge */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-3 py-1.5 shadow-sm transition hover:shadow-md">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-sm">
                <FiUser size={14} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500"></span>
            </div>
            <div className="hidden sm:block">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Admin</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">System Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}