"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 4800 },
  { month: "Apr", revenue: 6100 },
  { month: "May", revenue: 7200 },
  { month: "Jun", revenue: 6800 },
  { month: "Jul", revenue: 8400 },
  { month: "Aug", revenue: 9200 },
  { month: "Sep", revenue: 10200 },
  { month: "Oct", revenue: 11400 },
  { month: "Nov", revenue: 12800 },
  { month: "Dec", revenue: 14500 },
];

export default function RevenueChart() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-900">Revenue Overview</h2>
          <p className="mt-1 text-sm text-slate-400">Monthly revenue performance</p>
        </div>

        <select
          aria-label="Select year"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        >
          <option>2026</option>
          <option>2025</option>
          <option>2024</option>
        </select>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revenueStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="url(#revenueStroke)"
              strokeWidth={3}
              fill="url(#revenueFill)"
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: "#6366f1" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}