import Sidebar from "@/app/components/Sidebar";
import SalesPage from "./SalesPage";

export const metadata = {
  title: "Sales Management | Shop CRM",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors">
      <Sidebar />
      <main className="ml-72">
        <SalesPage />
      </main>
    </div>
  );
}
