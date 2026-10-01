import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const tones = {
  blue: { icon: "from-blue-500 to-blue-600 shadow-blue-200", bar: "from-blue-500 to-blue-300" },
  indigo: { icon: "from-indigo-500 to-indigo-600 shadow-indigo-200", bar: "from-indigo-500 to-indigo-300" },
  purple: { icon: "from-purple-500 to-fuchsia-600 shadow-purple-200", bar: "from-purple-500 to-fuchsia-300" },
  emerald: { icon: "from-emerald-500 to-teal-600 shadow-emerald-200", bar: "from-emerald-500 to-teal-300" },
  amber: { icon: "from-amber-400 to-orange-500 shadow-amber-200", bar: "from-amber-400 to-orange-300" },
};

type DashboardCardProps = {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  icon: React.ElementType;
  color?: keyof typeof tones;
};

export default function DashboardCard({
  title,
  value,
  change,
  positive = true,
  icon: Icon,
  color = "blue",
}: DashboardCardProps) {
  const tone = tones[color];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Top accent */}
      <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.bar}`} />

      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 truncate text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div
          className={`ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${tone.icon}`}
        >
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
            positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          }`}
        >
          {positive ? (
            <ArrowUpRight size={13} strokeWidth={2.5} />
          ) : (
            <ArrowDownRight size={13} strokeWidth={2.5} />
          )}
          {change}
        </span>
        <span className="text-xs text-slate-400">vs last month</span>
      </div>
    </div>
  );
}