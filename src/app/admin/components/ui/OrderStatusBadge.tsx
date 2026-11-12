export const orderStatusLabels: Record<number, string> = {
  1: "Pending",
  2: "Confirmed",
  3: "Processing",
  4: "Shipped",
  5: "Out For Delivery",
  6: "Delivered",
  7: "Cancelled",
  8: "Returned",
};

export const paymentStatusLabels: Record<number, string> = {
  1: "Pending",
  2: "Paid",
  3: "Failed",
  4: "Refunded",
};

export function getStatusLabel(
  status: string | number,
  labels: Record<number, string>
) {
  if (typeof status === "number") return labels[status] ?? "Unknown";

  return status.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ");
}

export function getStatusNumber(status: string | number): number | null {
  if (typeof status === "number") return status;

  const entry = Object.entries(orderStatusLabels).find(
    ([, label]) =>
      label.replace(/\s/g, "").toLowerCase() ===
      status.replace(/[\s_]/g, "").toLowerCase()
  );

  return entry ? Number(entry[0]) : null;
}

const toneFor = (label: string) => {
  const value = label.toLowerCase();

  if (value === "paid" || value === "delivered")
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/15";
  if (value === "pending" || value === "confirmed")
    return "bg-amber-50 text-amber-700 ring-amber-600/15";
  if (["cancelled", "failed", "refunded", "returned"].includes(value))
    return "bg-red-50 text-red-700 ring-red-600/15";

  return "bg-indigo-50 text-indigo-700 ring-indigo-600/15";
};

export default function OrderStatusBadge({
  status,
  payment = false,
}: {
  status: string | number;
  payment?: boolean;
}) {
  const label = getStatusLabel(
    status,
    payment ? paymentStatusLabels : orderStatusLabels
  );

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${toneFor(
        label
      )}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}