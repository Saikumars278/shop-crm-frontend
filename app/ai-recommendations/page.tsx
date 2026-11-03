import Sidebar from "@/app/components/Sidebar";
import AiForecastDashboard from "./AiForecastDashboard";

export const metadata = {
  title: "AI Forecast & Recommendations | Shop CRM",
  description: "Next month predictive sales forecasting, product recommendations, and payment analysis",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors overflow-x-hidden">
      <Sidebar />
      <main className="crm-main-content">
        <AiForecastDashboard />
      </main>
    </div>
  );
}
