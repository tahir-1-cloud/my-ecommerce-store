import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const tones = {
  indigo: { icon: "bg-indigo-50 text-indigo-600", stroke: "#6366f1" },
  violet: { icon: "bg-violet-50 text-violet-600", stroke: "#8b5cf6" },
  emerald: { icon: "bg-emerald-50 text-emerald-600", stroke: "#10b981" },
  amber: { icon: "bg-amber-50 text-amber-600", stroke: "#f59e0b" },
};

type DashboardCardProps = {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  icon: React.ElementType;
  color?: keyof typeof tones;
  trend?: number[];
};

function Sparkline({
  data,
  color,
  id,
}: {
  data: number[];
  color: string;
  id: string;
}) {
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
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
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
  icon: Icon,
  color = "indigo",
  trend = [4, 6, 5, 8, 7, 10, 9, 12],
}: DashboardCardProps) {
  const tone = tones[color];
  const gradientId = `spark-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-[28px] font-bold leading-none tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}
        >
          <Icon size={21} strokeWidth={2} />
        </div>
      </div>

      {/* Sparkline */}
      <div className="mt-4">
        <Sparkline data={trend} color={tone.stroke} id={gradientId} />
      </div>

      {/* Bottom */}
      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
        <span
          className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
            positive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {positive ? (
            <ArrowUpRight size={13} strokeWidth={2.5} />
          ) : (
            <ArrowDownRight size={13} strokeWidth={2.5} />
          )}
          {change}
        </span>

        <span className="text-xs font-medium text-slate-400">
          vs last month
        </span>
      </div>
    </div>
  );
}