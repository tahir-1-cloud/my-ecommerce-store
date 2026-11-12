"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Package, RefreshCw, ShoppingBag, Wallet } from "lucide-react";

import DashboardCard from "./components/DashboardCard";
import Button from "@/app/admin/components/ui/Button";
import OrderStatusBadge from "@/app/admin/components/ui/OrderStatusBadge";

import { notify } from "@/lib/notify";
import { ApiError } from "@/lib/apierror";
import { adminOrderService } from "@/services/adminOrderService";
import { productService } from "@/services/productService";
import type { AdminOrder, AdminOrderSummary } from "@/types/orders";
import type { Product } from "@/types/product";

const getMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError
    ? error.message
    : error instanceof Error
      ? error.message
      : fallback;

const formatAmount = (value: number) =>
  `$${Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Top Products abhi static hai (backend data baad mein)
const topProducts = [
  { name: "Wireless Earbuds", sales: 182, percent: 92 },
  { name: "Smart Watch Pro", sales: 141, percent: 72 },
  { name: "Leather Backpack", sales: 98, percent: 50 },
  { name: "Running Shoes", sales: 76, percent: 39 },
];

export default function AdminDashboard() {
  const [summary, setSummary] = useState<AdminOrderSummary | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    const [summaryResult, ordersResult, productsResult] =
      await Promise.allSettled([
        adminOrderService.getSummary(),
        adminOrderService.getAll(1, 5),
        productService.getAll(),
      ]);

    if (summaryResult.status === "fulfilled") {
      setSummary(summaryResult.value.data);
    } else {
      notify.error(getMessage(summaryResult.reason, "Unable to load summary."));
    }

    if (ordersResult.status === "fulfilled") {
      setOrders(
        Array.isArray(ordersResult.value.data) ? ordersResult.value.data : []
      );
    } else {
      notify.error(getMessage(ordersResult.reason, "Unable to load orders."));
    }

    if (productsResult.status === "fulfilled") {
      setProducts(
        Array.isArray(productsResult.value) ? productsResult.value : []
      );
    } else {
      notify.error(
        getMessage(productsResult.reason, "Unable to load products.")
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [orders]
  );

  const activeProducts = products.filter((product) => product.isActive).length;
  const dash = "—";

  return (
    <div className="space-y-8 font-sans">
      {/* Toolbar (title header mein already hai) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-500">
          Monitor your store performance, orders, products, and revenue.
        </p>

   
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Total Revenue"
          value={loading ? dash : formatAmount(summary?.totalRevenue ?? 0)}
          icon={Wallet}
          color="emerald"
        />
        <DashboardCard
          title="Total Orders"
          value={loading ? dash : summary?.totalOrders ?? 0}
          icon={ShoppingBag}
          color="indigo"
        />
        <DashboardCard
          title="Pending Orders"
          value={loading ? dash : summary?.pendingOrders ?? 0}
          icon={Clock}
          color="violet"
        />
        <DashboardCard
          title="Total Products"
          value={loading ? dash : products.length}
          icon={Package}
          color="amber"
          change={loading ? undefined : `${activeProducts} active`}
          caption="in your store"
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

            <Link
              href="/admin/orders"
              className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
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
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 w-full max-w-[110px] animate-pulse rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-3.5 font-semibold">
                        <Link
                          href="/admin/orders"
                          className="text-slate-900 hover:text-indigo-600"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700">
                        {order.customerName || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        {formatAmount(order.totalAmount)}
                      </td>
                      <td className="px-5 py-3.5">
                        <OrderStatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products (static) */}
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