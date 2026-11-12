"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  CreditCard,
  History,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  User,
} from "lucide-react";

import Modal from "@/app/admin/components/ui/Modal";
import Button from "@/app/admin/components/ui/Button";
import Loader from "@/app/admin/components/ui/Loader";
import { Select, Textarea } from "@/app/admin/components/ui/Field";
import OrderStatusBadge, {
  getStatusNumber,
  orderStatusLabels,
} from "@/app/admin/components/ui/OrderStatusBadge";



import type { AdminOrder, AdminOrderAddress } from "@/types/orders";

type OrderDetailsModalProps = {
  order: AdminOrder | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onUpdateStatus: (status: number, note: string) => Promise<void>;
};

const money = (value?: number) =>
  `$${Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const progressSteps = [1, 2, 3, 4, 5, 6];

const statusOptions = Object.entries(orderStatusLabels).map(
  ([value, label]) => ({ value, label })
);

const findAddress = (
  addresses: AdminOrderAddress[] | undefined,
  kind: "ship" | "bill"
) =>
  addresses?.find((address) => address.type?.toLowerCase().includes(kind)) ??
  null;

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100">
          <Icon size={16} strokeWidth={1.9} />
        </span>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function AddressBlock({ address }: { address: AdminOrderAddress | null }) {
  if (!address) return <p className="text-sm text-slate-500">Not provided.</p>;

  const lines = [
    address.addressLine1,
    address.addressLine2,
    [address.city, address.state, address.postalCode]
      .filter(Boolean)
      .join(", "),
    address.country,
  ].filter(Boolean);

  return (
    <div className="space-y-0.5 text-sm text-slate-600">
      <p className="font-semibold text-slate-900">{address.fullName}</p>
      {lines.map((line, i) => (
        <p key={i}>{line}</p>
      ))}
      {address.phoneNumber && (
        <p className="pt-1 font-medium text-slate-700">{address.phoneNumber}</p>
      )}
    </div>
  );
}

function OrderContent({
  order,
  onUpdateStatus,
}: {
  order: AdminOrder;
  onUpdateStatus: OrderDetailsModalProps["onUpdateStatus"];
}) {
  const currentStatus = getStatusNumber(order.status);

  const [newStatus, setNewStatus] = useState(
    currentStatus ? String(currentStatus) : ""
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const items = order.items ?? [];
  const payments = order.payments ?? [];
  const history = [...(order.statusHistory ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const shipping = findAddress(order.addresses, "ship");
  const billing = findAddress(order.addresses, "bill");

  const isNegative = currentStatus === 7 || currentStatus === 8;
  const unchanged = Number(newStatus) === currentStatus;

  const handleSave = async () => {
    if (!newStatus || unchanged || saving) return;

    try {
      setSaving(true);
      setError("");
      await onUpdateStatus(Number(newStatus), note.trim());
      setNote("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update order status."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Order
          </p>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">
            {order.orderNumber}
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <OrderStatusBadge status={order.paymentStatus} payment />
        </div>
      </div>

      {/* Progress */}
      {isNegative ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          This order is {orderStatusLabels[currentStatus!].toLowerCase()}.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <ol className="flex min-w-[560px] items-start">
            {progressSteps.map((step, index) => {
              const done = currentStatus !== null && step <= currentStatus;
              const last = index === progressSteps.length - 1;

              return (
                <li
                  key={step}
                  className={`relative flex flex-1 flex-col items-center text-center ${
                    last ? "flex-none" : ""
                  }`}
                >
                  {!last && (
                    <span
                      className={`absolute left-1/2 top-3.5 h-0.5 w-full ${
                        currentStatus !== null && step < currentStatus
                          ? "bg-[#4f46e5]"
                          : "bg-slate-200"
                      }`}
                    />
                  )}
                  <span
                    className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      done
                        ? "bg-[#4f46e5] text-white"
                        : "border-2 border-slate-300 bg-white text-slate-400"
                    }`}
                  >
                    {done ? <Check size={14} strokeWidth={3} /> : step}
                  </span>
                  <span
                    className={`mt-2 w-20 text-[11px] font-medium leading-tight ${
                      done ? "text-slate-900" : "text-slate-500"
                    }`}
                  >
                    {orderStatusLabels[step]}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Left */}
        <div className="space-y-5 lg:col-span-3">
          <Card icon={ReceiptText} title={`Items (${items.length})`}>
            {items.length === 0 ? (
              <p className="text-sm text-slate-500">No items found.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {items.map((item) => (
                  <li
                    key={item.productVariantId}
                    className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 ring-1 ring-inset ring-slate-200">
                      <Package size={20} strokeWidth={1.6} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {item.productName}
                      </p>
                      <p className="text-xs text-slate-500">
                        SKU: {item.sku} · {money(item.unitPrice)} ×{" "}
                        {item.quantity}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-slate-900">
                      {money(item.totalPrice)}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <dt>Subtotal</dt>
                <dd className="font-medium text-slate-900">
                  {money(order.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between text-slate-600">
                <dt>Shipping</dt>
                <dd className="font-medium text-slate-900">
                  {order.shippingAmount ? money(order.shippingAmount) : "Free"}
                </dd>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>Discount</dt>
                  <dd className="font-medium">-{money(order.discountAmount)}</dd>
                </div>
              )}
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <dt>Tax</dt>
                  <dd className="font-medium text-slate-900">
                    {money(order.taxAmount)}
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-3.5 py-3 ring-1 ring-inset ring-indigo-100">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="text-lg font-bold text-indigo-700">
                  {money(order.totalAmount)}
                </dd>
              </div>
            </dl>
          </Card>

          <Card icon={History} title="Status history">
            {history.length === 0 ? (
              <p className="text-sm text-slate-500">No history yet.</p>
            ) : (
              <ol className="relative space-y-5 border-l-2 border-slate-200 pl-5">
                {history.map((entry, index) => (
                  <li key={`${entry.createdAt}-${index}`} className="relative">
                    <span
                      className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white ${
                        index === 0 ? "bg-[#4f46e5]" : "bg-slate-300"
                      }`}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <OrderStatusBadge status={entry.status} />
                      <span className="text-xs text-slate-500">
                        {formatDateTime(entry.createdAt)}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="mt-1.5 text-sm text-slate-600">
                        {entry.note}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-5 lg:col-span-2">
          <Card icon={User} title="Customer">
            <p className="text-sm font-semibold text-slate-900">
              {order.customerName || "—"}
            </p>
            <p className="break-all text-sm text-slate-600">
              {order.customerEmail || "—"}
            </p>
            {order.customerPhone && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                <Phone size={13} className="text-slate-400" />
                {order.customerPhone}
              </p>
            )}
          </Card>

          <Card icon={MapPin} title="Shipping address">
            <AddressBlock address={shipping} />
          </Card>

          <Card icon={MapPin} title="Billing address">
            <AddressBlock address={billing} />
          </Card>

          <Card icon={CreditCard} title="Payment">
            {payments.length === 0 ? (
              <p className="text-sm text-slate-600">
                Method:{" "}
                <span className="font-semibold text-slate-900">
                  {order.paymentMethod || "—"}
                </span>
              </p>
            ) : (
              <ul className="space-y-4">
                {payments.map((payment, index) => (
                  <li
                    key={`${payment.transactionId ?? "p"}-${index}`}
                    className="space-y-1.5 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900">
                        {payment.method || order.paymentMethod}
                      </span>
                      <OrderStatusBadge status={payment.status} payment />
                    </div>
                    <p className="text-slate-600">
                      {payment.provider} · {money(payment.amount)}{" "}
                      {payment.currency}
                    </p>
                    {payment.transactionId && (
                      <p className="break-all text-xs text-slate-500">
                        Txn: {payment.transactionId}
                      </p>
                    )}
                    {payment.paidAt && (
                      <p className="text-xs text-slate-500">
                        Paid on {formatDateTime(payment.paidAt)}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Update status */}
      <section className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-slate-900">
          Update order status
        </h3>
        <p className="mb-4 mt-0.5 text-sm text-slate-500">
          Add an optional note about this change.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Select
            label="New status"
            options={statusOptions}
            value={newStatus}
            onChange={(event) => setNewStatus(event.target.value)}
            disabled={saving}
          />

          <div className="md:col-span-2">
            <Textarea
              label="Note"
              optional
              rows={2}
              maxLength={500}
              placeholder="e.g. Handed over to the courier"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              disabled={saving}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={!newStatus || unchanged}
          >
            Update Status
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function OrderDetailsModal({
  order,
  loading,
  error,
  onClose,
  onUpdateStatus,
}: OrderDetailsModalProps) {
  return (
    <Modal
      title="Order Details"
      description="Review the order and update its status."
      icon={<ReceiptText size={19} strokeWidth={1.9} />}
      size="xl"
      onClose={onClose}
      closeDisabled={loading}
    >
      <div className="max-h-[70vh] overflow-y-auto p-5 sm:p-6">
        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <Loader size="md" />
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        ) : order ? (
          <OrderContent
            key={`${order.id}-${order.status}`}
            order={order}
            onUpdateStatus={onUpdateStatus}
          />
        ) : null}
      </div>

      <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-6 py-4">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Close
        </Button>
      </div>
    </Modal>
  );
}