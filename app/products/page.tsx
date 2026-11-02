import "./product.css";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import ProductHeader from "./ProductHeader";
import ProductStats from "./ProductStats";
// import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";

export default function ProductsPage() {
  return (
    <div className="dashboard bg-slate-100 dark:bg-slate-950 transition-colors">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="mt-8 space-y-6">
          <ProductHeader />
          <ProductStats />
          {/* <ProductFilters /> */}
          <ProductTable />
        </section>
      </main>
    </div>
  );
}