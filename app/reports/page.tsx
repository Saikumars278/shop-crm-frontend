import Sidebar from "@/app/components/Sidebar";
import ReportsPage from "./ReportsPage";

export const metadata = {
  title: "Reports | Shop CRM",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors">
      <Sidebar />
      <main className="ml-72">
        <ReportsPage />
      </main>
    </div>
  );
}
