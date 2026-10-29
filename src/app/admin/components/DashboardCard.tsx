import { useId } from "react";
import type { ElementType } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const tones = {
  indigo: {
    icon: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    stroke: "#4f46e5",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600 ring-violet-100",
    stroke: "#7c3aed",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    stroke: "#059669",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 ring-amber-100",
    stroke: "#d97706",
  },
};

type DashboardCardProps = {
  title: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  caption?: string;
  icon: ElementType;
  color?: keyof typeof tones;
  trend?: number[];
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const gradientId = useId();

  if (data.length < 2) return null;

  const w = 120;
  const h = 40;
  const pad = 3;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - pad - ((v - min) / range) * (h - pad * 2),
  ]);

  const line = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="h-10 w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.16" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function DashboardCard({
  title,
  value,
  change,
  positive = true,
  caption = "vs last month",
  icon: Icon,
  color = "indigo",
  trend,
}: DashboardCardProps) {
  const tone = tones[color];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 font-sans antialiased shadow-sm transition-shadow duration-200 hover:border-slate-300 hover:shadow-md">
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-[28px] font-bold leading-none tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${tone.icon}`}
        >
          <Icon size={21} strokeWidth={1.9} />
        </span>
      </div>

      {/* Sparkline */}
      {trend && trend.length > 1 && (
        <div className="mt-4">
          <Sparkline data={trend} color={tone.stroke} />
        </div>
      )}

      {/* Bottom */}
      {change && (
        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
          <span
            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
              positive
                ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
                : "bg-red-50 text-red-700 ring-red-600/15"
            }`}
          >
            {positive ? (
              <ArrowUpRight size={13} strokeWidth={2.5} />
            ) : (
              <ArrowDownRight size={13} strokeWidth={2.5} />
            )}
            {change}
          </span>

          <span className="text-xs font-medium text-slate-400">{caption}</span>
        </div>
      )}
    </div>
  );
}