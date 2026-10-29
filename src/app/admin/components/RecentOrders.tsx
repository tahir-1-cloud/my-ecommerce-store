"use client";

import { useId } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";

export type OrdersChartPoint = {
  day: string;
  orders: number;
};

type OrdersChartProps = {
  data?: OrdersChartPoint[];
  title?: string;
  subtitle?: string;
};

type ChartTooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{ value?: number | string }>;
};

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-sans shadow-[0_12px_32px_-8px_rgba(15,23,42,0.18)]">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">
        {payload[0].value}{" "}
        <span className="font-medium text-slate-500">orders</span>
      </p>
    </div>
  );
}

export default function OrdersChart({
  data = [],
  title = "Orders",
  subtitle = "Orders this week",
}: OrdersChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const hasData = data.length > 0;
  const peak = hasData ? Math.max(...data.map((d) => d.orders)) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 font-sans antialiased shadow-sm sm:p-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        </div>

        {hasData && (
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#4f46e5]" />
              Orders
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#252268]" />
              Best day
            </span>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="flex h-[320px] flex-col items-center justify-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 ring-1 ring-inset ring-slate-200">
            <BarChart3 size={22} strokeWidth={1.8} />
          </span>
          <p className="text-sm font-medium text-slate-600">No data yet</p>
        </div>
      ) : (
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id={`${gradientId}-main`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
                <linearGradient
                  id={`${gradientId}-peak`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#312e81" />
                  <stop offset="100%" stopColor="#252268" />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
              />
              <Tooltip
                cursor={{ fill: "#eef2ff" }}
                content={<ChartTooltip />}
              />
              <Bar dataKey="orders" radius={[8, 8, 0, 0]} maxBarSize={44}>
                {data.map((d) => (
                  <Cell
                    key={d.day}
                    fill={
                      d.orders === peak
                        ? `url(#${gradientId}-peak)`
                        : `url(#${gradientId}-main)`
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}