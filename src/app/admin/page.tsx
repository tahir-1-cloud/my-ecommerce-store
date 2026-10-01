import { Package, ShoppingBag, Users, Wallet } from "lucide-react";

import DashboardCard from "./components/DashboardCard";
import OrdersChart from "./components/OrdersChart";
import RecentOrders from "./components/RecentOrders";
import RevenueChart from "./components/RevenueChart";
import TopProducts from "./components/TopProducts";

function SectionTitle({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          Monitor your store performance, orders, products, and revenue.
        </p>
      </div>

      {/* Overview Cards */}
      <section>
        <SectionTitle
          title="Store Overview"
          text="Key metrics from your online store."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Total Products"
            value="120"
            change="+8.2%"
            positive
            icon={Package}
            color="amber"
          />
          <DashboardCard
            title="Total Orders"
            value="86"
            change="+12.5%"
            positive
            icon={ShoppingBag}
            color="indigo"
          />
          <DashboardCard
            title="Customers"
            value="245"
            change="+5.4%"
            positive
            icon={Users}
            color="purple"
          />
          <DashboardCard
            title="Total Revenue"
            value="$12,450"
            change="+10.8%"
            positive
            icon={Wallet}
            color="emerald"
          />
        </div>
      </section>

      {/* Sales Analytics */}
      <section>
        <SectionTitle
          title="Sales Analytics"
          text="Track your store revenue and order activity."
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <RevenueChart />
          <OrdersChart />
        </div>
      </section>

      {/* Orders & Products */}
      <section>
        <SectionTitle
          title="Store Activity"
          text="Review recent orders and your best-performing products."
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RecentOrders />
          </div>
          <TopProducts />
        </div>
      </section>

      {/* Inventory */}
      <section>
        <SectionTitle
          title="Inventory"
          text="Keep an eye on products that need attention."
        />
      </section>
    </div>
  );
}