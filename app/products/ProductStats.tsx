"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiPackage,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiArrowRight,
} from "react-icons/fi";

const iconMap = {
  "Total Products": FiPackage,
  "Available Stock": FiCheckCircle,
  "Low Stock": FiAlertTriangle,
  "Out of Stock": FiXCircle,
};

const filterMap = {
  "Total Products": "",
  "Available Stock": "In Stock",
  "Low Stock": "Low Stock",
  "Out of Stock": "Out of Stock",
};

// Static classes for reliable Tailwind v4 rendering
const cardTheme: Record<
  string,
  {
    gradient: string;
    lightBg: string;
    dotColor: string;
    textColor: string;
    barColor: string;
  }
> = {
  "Total Products": {
    gradient: "from-blue-600 to-cyan-500",
    lightBg: "bg-blue-50 dark:bg-blue-950/40",
    dotColor: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
    barColor: "bg-blue-600",
  },
  "Available Stock": {
    gradient: "from-emerald-600 to-teal-500",
    lightBg: "bg-emerald-50 dark:bg-emerald-950/40",
    dotColor: "bg-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400",
    barColor: "bg-emerald-600",
  },
  "Low Stock": {
    gradient: "from-amber-500 to-orange-500",
    lightBg: "bg-amber-50 dark:bg-amber-950/40",
    dotColor: "bg-amber-500",
    textColor: "text-amber-600 dark:text-amber-400",
    barColor: "bg-amber-500",
  },
  "Out of Stock": {
    gradient: "from-rose-600 to-red-500",
    lightBg: "bg-rose-50 dark:bg-rose-950/40",
    dotColor: "bg-rose-500",
    textColor: "text-rose-600 dark:text-rose-400",
    barColor: "bg-rose-600",
  },
};

interface Stat {
  title: string;
  value: number;
  subtitle: string;
  growth: string;
  progress: string;
  gradient: string;
  light: string;
  text: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    
    let totalDuration = 800;
    let incrementTime = Math.max(10, Math.floor(totalDuration / (end || 1)));
    
    let timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value]);

  return <>{displayValue}</>;
}

export default function ProductStats() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadStats = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/products/stats/");
      if (!res.ok) throw new Error("Failed to load stats");
      const data = await res.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Product Stats Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleCardClick = (title: string) => {
    const status = filterMap[title as keyof typeof filterMap];
    if (status !== undefined) {
      router.push(`?status=${encodeURIComponent(status)}`, { scroll: false });
    }
  };

  if (loading) {
    return (
      <section className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 w-full min-w-0">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-36 sm:h-44 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
        ))}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 w-full min-w-0">
      {stats.map((item) => {
        const Icon = iconMap[item.title as keyof typeof iconMap] || FiPackage;
        const theme = cardTheme[item.title] || {
          gradient: "from-blue-600 to-indigo-500",
          lightBg: "bg-blue-50 dark:bg-blue-950/40",
          dotColor: "bg-blue-500",
          textColor: "text-blue-600 dark:text-blue-400",
          barColor: "bg-blue-600",
        };

        return (
          <div
            key={item.title}
            onClick={() => handleCardClick(item.title)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 min-w-0 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-1.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${theme.dotColor}`}></span>
                      <span className={`relative inline-flex h-2 w-2 rounded-full ${theme.dotColor}`}></span>
                    </span>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                      {item.title}
                    </p>
                  </div>
                  <h2 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                    <AnimatedNumber value={item.value} />
                  </h2>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
                    {item.subtitle}
                  </p>
                </div>

                <div
                  className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${theme.gradient} text-white shadow-xs transition-transform duration-300 group-hover:scale-105`}
                >
                  <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>
              </div>
            </div>

            <div className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-2.5">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                <span className={`font-semibold ${theme.textColor} truncate`}>
                  {item.growth}
                </span>
                <span className="font-bold text-slate-600 dark:text-slate-300 shrink-0">
                  {item.progress}
                </span>
              </div>

              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full ${theme.barColor} transition-all duration-1000 ease-out`}
                  style={{ width: item.progress }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
