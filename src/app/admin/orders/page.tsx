"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  CheckCircle2,
  Clock,
  Eye,
  Package,
  RefreshCw,
  ShoppingBag,
  Wallet,
} from "lucide-react";

import DataGrid from "../components/common/DataGrid";
import IconButton from "../components/ui/IconButton";
import Button from "@/app/admin/components/ui/Button";
import OrderStatusBadge, {
  getStatusLabel,
  orderStatusLabels,
  paymentStatusLabels,
} from "@/app/admin/components/ui/OrderStatusBadge";
import OrderDetailsModal from "../components/Model/OrderDetailsModal";

import { notify } from "@/lib/notify";
import { adminOrderService } from "@/services/adminOrderService";
import type {
  AdminOrder,
  AdminOrderSummary,
  OrderStatus,
} from "@/types/orders";
import { ApiError } from "@/lib/apierror";

const getMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError
    ? error.message
    : error instanceof Error
      ? error.message
      : fallback;

type StatTone = "indigo" | "emerald" | "slate" | "amber";

const statTones: Record<StatTone, string> = {
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
};

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: ElementType;
  tone: StatTone;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${statTones[tone]}`}
      >
        <Icon size={22} strokeWidth={1.9} />
      </span>

      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-2xl font-bold leading-none tracking-tight text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function formatAmount(value: number) {
  return `$${Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [summary, setSummary] = useState<AdminOrderSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);

    try {
      const result = await adminOrderService.getAll(1, 100);

      if (!Array.isArray(result.data)) {
        throw new Error("The orders API did not return a valid array.");
      }

      setOrders(result.data);
    } catch (error) {
      notify.error(getMessage(error, "Unable to load orders."));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSummary = useCallback(async () => {
    try {
      const result = await adminOrderService.getSummary();
      setSummary(result.data);
    } catch (error) {
      notify.error(getMessage(error, "Unable to load order summary."));
    }
  }, []);

  useEffect(() => {
    void loadOrders();
    void loadSummary();
  }, [loadOrders, loadSummary]);

  const fetchDetails = useCallback(async (id: number) => {
    const result = await adminOrderService.getById(id);
    setSelectedOrder(result.data);
  }, []);

  const openDetails = useCallback(
    async (order: AdminOrder) => {
      setDetailsOpen(true);
      setSelectedId(order.id);
      setSelectedOrder(null);
      setDetailsError(null);
      setDetailsLoading(true);

      try {
        await fetchDetails(order.id);
      } catch (error) {
        const message = getMessage(error, "Unable to load order details.");
        setDetailsError(message);
        notify.error(message);
      } finally {
        setDetailsLoading(false);
      }
    },
    [fetchDetails]
  );

  function closeDetails() {
    if (detailsLoading) return;

    setDetailsOpen(false);
    setSelectedId(null);
    setSelectedOrder(null);
    setDetailsError(null);
  }

  // Modal error khud dikhata hai, is liye yahan throw hota hai
  async function handleUpdateStatus(status: number, note: string) {
    if (selectedId === null) return;

    try {
      await adminOrderService.updateStatus(selectedId, {
        status: status as OrderStatus,
        note: note || null,
      });
    } catch (error) {
      throw new Error(getMessage(error, "Unable to update order status."));
    }

    notify.updated(
      "Order status updated.",
      `Now marked as ${orderStatusLabels[status] ?? "updated"}.`
    );

    await Promise.all([
      fetchDetails(selectedId).catch(() => undefined),
      loadOrders(),
      loadSummary(),
    ]);
  }

  const columnDefs = useMemo<ColDef<AdminOrder>[]>(
    () => [
      {
        headerName: "Order ID",
        field: "orderNumber",
        minWidth: 160,
        cellClass: "font-semibold text-slate-900",
      },
      {
        headerName: "Customer",
        field: "customerName",
        minWidth: 170,
        cellClass: "font-medium text-slate-700",
        valueFormatter: (params) => params.value || "—",
      },
      {
        headerName: "Email",
        field: "customerEmail",
        minWidth: 210,
        cellClass: "text-slate-600",
        valueFormatter: (params) => params.value || "—",
      },
      {
        headerName: "Items",
        field: "itemsCount",
        width: 100,
        minWidth: 90,
        maxWidth: 110,
        flex: 0,
        filter: "agNumberColumnFilter",
        cellClass: "font-medium text-slate-700",
      },
      {
        headerName: "Total",
        field: "totalAmount",
        minWidth: 130,
        filter: "agNumberColumnFilter",
        valueFormatter: (params) => formatAmount(Number(params.value ?? 0)),
        cellClass: "font-semibold text-slate-900",
      },
      {
        headerName: "Order Status",
        field: "status",
        minWidth: 170,
        filter: "agTextColumnFilter",
        filterValueGetter: (params) =>
          getStatusLabel(params.data?.status ?? "", orderStatusLabels),
        cellRenderer: (params: ICellRendererParams<AdminOrder>) =>
          params.data ? (
            <div className="flex h-full items-center">
              <OrderStatusBadge status={params.data.status} />
            </div>
          ) : null,
      },
      {
        headerName: "Payment",
        field: "paymentStatus",
        minWidth: 130,
        filter: "agTextColumnFilter",
        filterValueGetter: (params) =>
          getStatusLabel(params.data?.paymentStatus ?? "", paymentStatusLabels),
        cellRenderer: (params: ICellRendererParams<AdminOrder>) =>
          params.data ? (
            <div className="flex h-full items-center">
              <OrderStatusBadge status={params.data.paymentStatus} payment />
            </div>
          ) : null,
      },
      {
        headerName: "Order Date",
        field: "createdAt",
        minWidth: 140,
        filter: "agDateColumnFilter",
        valueFormatter: (params) => formatDate(params.value),
        cellClass: "text-slate-600",
      },
      {
        headerName: "Actions",
        colId: "actions",
        width: 90,
        minWidth: 90,
        maxWidth: 100,
        flex: 0,
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: (params: ICellRendererParams<AdminOrder>) => {
          const order = params.data;
          if (!order) return null;

          return (
            <div className="flex h-full items-center">
              <IconButton
                label={`View order ${order.orderNumber}`}
                tone="primary"
                icon={<Eye size={16} strokeWidth={1.9} />}
                onClick={() => void openDetails(order)}
              />
            </div>
          );
        },
      },
    ],
    [openDetails]
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Summary */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <StatCard
          label="Total Orders"
          value={loading ? "—" : summary?.totalOrders ?? 0}
          icon={ShoppingBag}
          tone="indigo"
        />
        <StatCard
          label="Pending Orders"
          value={loading ? "—" : summary?.pendingOrders ?? 0}
          icon={Clock}
          tone="amber"
        />
        <StatCard
          label="Processing Orders"
          value={loading ? "—" : summary?.processingOrders ?? 0}
          icon={Package}
          tone="slate"
        />
        <StatCard
          label="Delivered Orders"
          value={loading ? "—" : summary?.deliveredOrders ?? 0}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="Total Revenue"
          value={loading ? "—" : formatAmount(summary?.totalRevenue ?? 0)}
          icon={Wallet}
          tone="emerald"
        />
      </section>

      {/* Orders table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              All Orders
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              View customer orders and update their status.
            </p>
          </div>

        </div>

        <div className="p-5 sm:p-6">
          <DataGrid<AdminOrder>
            rowData={orders}
            columnDefs={columnDefs}
            loading={loading}
            getRowId={({ data }) => String(data.id)}
            searchPlaceholder="Search orders..."
          />
        </div>
      </section>

      {detailsOpen && (
        <OrderDetailsModal
          order={selectedOrder}
          loading={detailsLoading}
          error={detailsError}
          onClose={closeDetails}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}