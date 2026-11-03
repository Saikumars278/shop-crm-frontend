import Sidebar from "../components/Sidebar";
import BillingPage from "./Billingpage";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors overflow-x-hidden">
      <Sidebar />

      <main className="crm-main-fluid">
        <BillingPage />
      </main>
    </div>
  );
}
