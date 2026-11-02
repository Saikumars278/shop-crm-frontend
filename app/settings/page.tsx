import Sidebar from "@/app/components/Sidebar";
import SettingsPage from "./SettingsPage";

export const metadata = {
  title: "Settings | Shop CRM",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors">
      <Sidebar />
      <main className="ml-72">
        <SettingsPage />
      </main>
    </div>
  );
}
