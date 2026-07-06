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
    <header className="mb-4 rounded-2xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-white dark:bg-slate-900 dark:bg-slate-900 shadow-sm">
      <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}
        <div>
          <span className="inline-flex rounded-full bg-blue-50 dark:bg-blue-950 px-4 py-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
            {greeting}
          </span>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-800 dark:text-white dark:text-white">
            Admin Dashboard
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <FiCalendar className="text-blue-600" size={14} />
              {today}
            </div>
            <div className="flex items-center gap-1.5">
              <FiClock className="text-green-600" size={14} />
              {time}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-1 items-center justify-end gap-4">
          {/* Search */}
          <div className="flex w-full max-w-md items-center rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 px-4 py-2 transition-all duration-300 focus-within:border-blue-500 focus-within:bg-white dark:bg-slate-900 dark:focus-within:bg-slate-700 focus-within:shadow-md">
            <FiSearch size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search products, invoices, stock..."
              className="ml-2.5 w-full bg-transparent text-sm text-slate-700 dark:text-slate-200 dark:text-slate-200 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Settings */}
          <button className="rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 p-2.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 hover:shadow-md">
            <FiSettings size={16} className="text-slate-600 dark:text-slate-300 dark:text-slate-400" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-800 px-3 py-2 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow">
                <FiUser size={15} />
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-800 bg-green-500"></span>
            </div>
            <div className="hidden sm:block">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white dark:text-white">Admin</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">System Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}