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
    if (start === end) return;
    
    let totalDuration = 1000;
    let incrementTime = (totalDuration / end);
    
    let timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      if (start === end) clearInterval(timer);
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
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-60 animate-pulse rounded-3xl bg-slate-100 border border-slate-200 dark:border-slate-700" />
        ))}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = iconMap[item.title as keyof typeof iconMap] || FiPackage;

        return (
          <div
            key={item.title}
            onClick={() => handleCardClick(item.title)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300"
          >
            {/* Decorative BG element */}
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${item.gradient} opacity-10 transition-transform duration-500 group-hover:scale-150`}></div>

            <div className="relative p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${item.light.replace('bg-', 'bg-').replace('-50', '-400')}`}></span>
                      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${item.light.replace('bg-', 'bg-').replace('-50', '-500')}`}></span>
                    </span>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {item.title}
                    </p>
                  </div>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    <AnimatedNumber value={item.value} />
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {item.subtitle}
                  </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r ${item.gradient} text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon size={18} />
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold ${item.text}`}>
                      {item.growth}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    View list <FiArrowRight size={10} />
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-3">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.gradient} transition-all duration-1000 ease-out`}
                      style={{ width: item.progress }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.progress}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}