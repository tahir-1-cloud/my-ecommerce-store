import {
  CalendarDays,
  Download,
  Package,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";

import DashboardCard from "./components/DashboardCard";

type OrderStatus = "Delivered" | "Processing" | "Pending" | "Cancelled";

const statusStyles: Record<OrderStatus, string> = {
  Delivered: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  Processing: "bg-blue-50 text-blue-700 ring-blue-600/15",
  Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Cancelled: "bg-red-50 text-red-700 ring-red-600/15",
};

const recentOrders: {
  id: string;
  customer: string;
  date: string;
  amount: string;
  status: OrderStatus;
}[] = [
  { id: "#1042", customer: "Ali Raza", date: "Oct 01, 2026", amount: "$240.00", status: "Processing" },
  { id: "#1041", customer: "Sara Khan", date: "Sep 30, 2026", amount: "$89.50", status: "Delivered" },
  { id: "#1040", customer: "Usman Tariq", date: "Sep 30, 2026", amount: "$512.00", status: "Pending" },
  { id: "#1039", customer: "Ayesha Noor", date: "Sep 29, 2026", amount: "$120.75", status: "Delivered" },
  { id: "#1038", customer: "Hamza Ali", date: "Sep 29, 2026", amount: "$64.00", status: "Cancelled" },
];

const topProducts = [
  { name: "Wireless Earbuds", sales: 182, percent: 92 },
  { name: "Smart Watch Pro", sales: 141, percent: 72 },
  { name: "Leather Backpack", sales: 98, percent: 50 },
  { name: "Running Shoes", sales: 76, percent: 39 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8 font-sans">
      {/* Toolbar (title header mein already hai) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-500">
          Monitor your store performance, orders, products, and revenue.
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <CalendarDays size={16} className="text-slate-400" />
            Last 30 days
          </button>

          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-600"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Total Revenue"
          value="$12,450"
          change="+10.8%"
          icon={Wallet}
          color="emerald"
          trend={[5, 7, 6, 9, 8, 11, 10, 14]}
        />
        <DashboardCard
          title="Total Orders"
          value="86"
          change="+12.5%"
          icon={ShoppingBag}
          color="indigo"
          trend={[3, 5, 4, 7, 6, 8, 9, 11]}
        />
        <DashboardCard
          title="Customers"
          value="245"
          change="+5.4%"
          icon={Users}
          color="violet"
          trend={[6, 6, 7, 8, 7, 9, 9, 10]}
        />
        <DashboardCard
          title="Total Products"
          value="120"
          change="+8.2%"
          icon={Package}
          color="amber"
          trend={[4, 5, 5, 6, 8, 7, 9, 9]}
        />
      </section>

      {/* Orders + Top products */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Recent Orders
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Latest orders from your store.
              </p>
            </div>

            <a
              href="/admin/orders"
              className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              View all
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {order.id}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">
                      {order.customer}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {order.date}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {order.amount}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusStyles[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Top Products
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Best sellers this month.
          </p>

          <ul className="mt-5 space-y-5">
            {topProducts.map((product) => (
              <li key={product.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800">
                    {product.name}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {product.sales}
                    <span className="ml-1 font-medium text-slate-400">
                      sold
                    </span>
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    style={{ width: `${product.percent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}