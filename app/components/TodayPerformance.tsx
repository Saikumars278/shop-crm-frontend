"use client";

import { useEffect, useState } from "react";
import {
  FiSun,
  FiDollarSign,
  FiFileText,
  FiCreditCard,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiCheckCircle,
  FiPackage,
  FiAward,
  FiUsers,
} from "react-icons/fi";

interface PerfData {
  today_revenue: number;
  today_bills: number;
  today_avg_bill: number;

  revenue_delta: number;
  bills_delta: number;
  avg_bill_delta: number;

  // footer stats
  profit: number;
  last_bill_time: string;

  completed_bills: number;
  items_sold: number;

  highest_bill: number;
  customers_count: number;

  today_day: string;
  days_in_month: number;
}

function TrendBadge({ value }: { value: number }) {
  const isUp = value >= 0;
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold " +
        (isUp
          ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
          : "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400")
      }
    >
      {isUp ? <FiTrendingUp size={11} /> : <FiTrendingDown size={11} />}
      {isUp ? "+" : ""}
      {value}%
    </span>
  );
}

function FooterStat({
  icon: Icon,
  label,
  value,
  align = "left",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={
        "flex items-center gap-2 " +
        (align === "right" ? "justify-end text-right" : "justify-start text-left")
      }
    >
      <Icon
        className="shrink-0 text-slate-400 dark:text-slate-500 dark:text-slate-400"
        size={12}
      />
      <div>
        <p className="text-[11px] font-medium leading-tight text-slate-500 dark:text-slate-400 dark:text-slate-400">
          {label}
        </p>
        <p className="text-sm font-bold leading-tight text-slate-800 dark:text-white dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  gradient,
  value,
  comparison,
  delta,
  leftIcon,
  leftLabel,
  leftValue,
  rightIcon,
  rightLabel,
  rightValue,
}: {
  icon: React.ElementType;
  label: string;
  gradient: string;
  value: string;
  comparison: string;
  delta: number;
  leftIcon: React.ElementType;
  leftLabel: string;
  leftValue: string;
  rightIcon: React.ElementType;
  rightLabel: string;
  rightValue: string;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      {/* Top section */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r " +
                gradient +
                " text-white shadow-sm transition-transform duration-300 group-hover:scale-110"
              }
            >
              <Icon size={13} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 dark:text-slate-400">
              {label}
            </p>
          </div>
          <TrendBadge value={delta} />
        </div>

        <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900 dark:text-white dark:text-white">
          {value}
        </h3>
        <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500 dark:text-slate-400">
          {comparison}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 dark:border-slate-800 dark:border-slate-800" />

      {/* Footer section */}
      <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 dark:bg-slate-800/30">
        <FooterStat icon={leftIcon} label={leftLabel} value={leftValue} />
        <FooterStat
          icon={rightIcon}
          label={rightLabel}
          value={rightValue}
          align="right"
        />
      </div>
    </div>
  );
}

export default function TodayPerformance() {
  const [data, setData] = useState<PerfData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = () => {
      fetch("http://127.0.0.1:8000/api/dashboard/today-performance/")
        .then((r) => r.json())
        .then((d) => {
          if (mounted) {
            setData(d);
            setLoading(false);
          }
        })
        .catch(() => {
          if (mounted) setLoading(false);
        });
    };

    load();
    const iv = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);

  const rupee = (n: number) =>
    "\u20b9" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-slate-800 dark:from-amber-950/30 dark:to-orange-950/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow">
            <FiSun size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white dark:text-white">
              Today's Performance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">
              Live business pulse — updates every 30s
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white dark:bg-slate-900 px-4 py-2 shadow-sm dark:bg-slate-800">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 dark:text-slate-200">
            Live
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="p-4">
        {loading || !data ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-700 p-4 dark:border-slate-700"
              >
                <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-4 h-8 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-4 h-6 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard
              icon={FiDollarSign}
              label="Today Revenue"
              gradient="from-orange-500 to-amber-400"
              value={rupee(data.today_revenue)}
              comparison="vs yesterday"
              delta={data.revenue_delta}
              leftIcon={FiDollarSign}
              leftLabel="Profit"
              leftValue={rupee(data.profit ?? 0)}
              rightIcon={FiClock}
              rightLabel="Last Bill"
              rightValue={data.last_bill_time ?? "--"}
            />
            <KpiCard
              icon={FiFileText}
              label="Bills Created"
              gradient="from-blue-500 to-cyan-500"
              value={String(data.today_bills)}
              comparison="vs yesterday"
              delta={data.bills_delta}
              leftIcon={FiCheckCircle}
              leftLabel="Completed"
              leftValue={String(data.completed_bills ?? 0)}
              rightIcon={FiPackage}
              rightLabel="Items Sold"
              rightValue={String(data.items_sold ?? 0)}
            />
            <KpiCard
              icon={FiCreditCard}
              label="Avg Bill Value"
              gradient="from-emerald-500 to-teal-500"
              value={rupee(data.today_avg_bill)}
              comparison="vs yesterday"
              delta={data.avg_bill_delta}
              leftIcon={FiAward}
              leftLabel="Highest Bill"
              leftValue={rupee(data.highest_bill ?? 0)}
              rightIcon={FiUsers}
              rightLabel="Customers"
              rightValue={String(data.customers_count ?? 0)}
            />
          </div>
        )}
      </div>
    </div>
  );
}