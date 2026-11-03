"use client";

import "./dashboard.css";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import StatCards from "@/app/components/StatCards";
import RevenueChart from "@/app/components/RevenueChart";
import TodayPerformance from "@/app/components/TodayPerformance";
import AiRecommendations from "@/app/components/AiRecommendations";
import StockOverview from "@/app/components/StockOverview";
import TopProducts from "@/app/components/TopProducts";
import RecentSales from "@/app/components/RecentSales";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main-content space-y-6">
        {/* Header on Top */}
        <Header />

                {/* ─── 12-COLUMN DASHBOARD GRID ─── */}
        <div className="grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-stretch w-full min-w-0">
          {/* Row 1: 4 KPI Cards */}
          <div className="col-span-12 min-w-0">
            <StatCards />
          </div>

          {/* Row 2: Revenue Analytics (8 columns on xl+) + Today's Target (4 columns on xl+) */}
          <div className="col-span-12 xl:col-span-8 flex flex-col min-w-0">
            <RevenueChart />
          </div>
          <div className="col-span-12 xl:col-span-4 flex flex-col min-w-0">
            <TodayPerformance />
          </div>

          {/* Row 3: AI Recommendations + Stock Overview (Equal Height 2-Column Grid on xl+) */}
          <div className="col-span-12 grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 items-stretch w-full min-w-0 box-border">
            <div className="w-full min-w-0 h-full min-h-[460px] flex flex-col box-border">
              <AiRecommendations />
            </div>
            <div className="w-full min-w-0 h-full min-h-[460px] flex flex-col box-border">
              <StockOverview />
            </div>
          </div>

          {/* Row 4: Top Products (6 columns on xl+) + Recent Bills (6 columns on xl+) */}
          <div className="col-span-12 xl:col-span-6 flex flex-col min-w-0">
            <TopProducts />
          </div>
          <div className="col-span-12 xl:col-span-6 flex flex-col min-w-0">
            <RecentSales />
          </div>
        </div>
      </main>
    </div>
  );
}



