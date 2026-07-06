"use client";

import "./dashboard.css";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import StatCards from "@/app/components/StatCards";
import RevenueChart from "@/app/components/RevenueChart";
import SalesChart from "@/app/components/SalesChart";
import StockOverview from "@/app/components/StockOverview";
import RecentSales from "@/app/components/RecentSales";
import LowStock from "@/app/components/LowStock";
import TodayPerformance from "@/app/components/TodayPerformance";
import TopProducts from "@/app/components/TopProducts";
import ExpiryAlerts from "@/app/components/ExpiryAlerts";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main-content">
        <Header />

        {/* Stat Cards */}
        <section className="mt-4">
          <StatCards />
        </section>

        {/* Today's Performance */}
        <section className="mt-4">
          <TodayPerformance />
        </section>

        {/* Revenue & Sales Charts */}
        <section className="dashboard-grid mt-8">
          <RevenueChart />
          <SalesChart />
        </section>

        {/* Top Products */}
        <section className="mt-4">
          <TopProducts />
        </section>

        {/* Main Layout — StockOverview | RecentSales + LowStock */}
        <section className="mt-8 dashboard-flex">

          {/* Left Column — Stock Overview only */}
          <div className="dashboard-column">
            <StockOverview />
            <ExpiryAlerts />
          </div>

          {/* Right Column — Recent Grocery Bills + Low Stock Products */}
          <div className="dashboard-column">
            <RecentSales />
            <LowStock />
          </div>

        </section>

      </main>
    </div>
  );
}