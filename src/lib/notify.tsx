"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { Toast } from "react-hot-toast";
import type { ElementType } from "react";
import {
  AlertTriangle,
  Check,
  Info,
  Pencil,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

type Variant =
  | "created"
  | "updated"
  | "deleted"
  | "success"
  | "error"
  | "warning"
  | "info";

type Style = {
  icon: ElementType;
  card: string;
  badge: string;
  title: string;
  desc: string;
  close: string;
  bar: string;
};

const green: Omit<Style, "icon"> = {
  card: "!bg-[#ecfdf5] !border-[#a7f3d0]",
  badge: "!bg-[#059669] shadow-[0_4px_10px_-2px_rgba(5,150,105,0.5)]",
  title: "!text-[#065f46]",
  desc: "!text-[#047857]",
  close: "!text-[#047857] hover:!bg-[#d1fae5]",
  bar: "!bg-[#10b981]",
};

const indigo: Omit<Style, "icon"> = {
  card: "!bg-[#eef2ff] !border-[#c7d2fe]",
  badge: "!bg-[#4f46e5] shadow-[0_4px_10px_-2px_rgba(79,70,229,0.5)]",
  title: "!text-[#312e81]",
  desc: "!text-[#4338ca]",
  close: "!text-[#4338ca] hover:!bg-[#e0e7ff]",
  bar: "!bg-[#6366f1]",
};

const red: Omit<Style, "icon"> = {
  card: "!bg-[#fef2f2] !border-[#fecaca]",
  badge: "!bg-[#dc2626] shadow-[0_4px_10px_-2px_rgba(220,38,38,0.5)]",
  title: "!text-[#7f1d1d]",
  desc: "!text-[#b91c1c]",
  close: "!text-[#b91c1c] hover:!bg-[#fee2e2]",
  bar: "!bg-[#ef4444]",
};

const amber: Omit<Style, "icon"> = {
  card: "!bg-[#fffbeb] !border-[#fde68a]",
  badge: "!bg-[#d97706] shadow-[0_4px_10px_-2px_rgba(217,119,6,0.5)]",
  title: "!text-[#78350f]",
  desc: "!text-[#b45309]",
  close: "!text-[#b45309] hover:!bg-[#fef3c7]",
  bar: "!bg-[#f59e0b]",
};

const sky: Omit<Style, "icon"> = {
  card: "!bg-[#f0f9ff] !border-[#bae6fd]",
  badge: "!bg-[#0284c7] shadow-[0_4px_10px_-2px_rgba(2,132,199,0.5)]",
  title: "!text-[#0c4a6e]",
  desc: "!text-[#0369a1]",
  close: "!text-[#0369a1] hover:!bg-[#e0f2fe]",
  bar: "!bg-[#0ea5e9]",
};

const styles: Record<Variant, Style> = {
  created: { icon: Check, ...green },
  updated: { icon: Pencil, ...indigo },
  deleted: { icon: Trash2, ...red },
  success: { icon: Check, ...green },
  error: { icon: XCircle, ...red },
  warning: { icon: AlertTriangle, ...amber },
  info: { icon: Info, ...sky },
};

const durations: Record<Variant, number> = {
  created: 3500,
  updated: 3500,
  deleted: 4000,
  success: 3500,
  error: 5000,
  warning: 4500,
  info: 3500,
};

type ToastCardProps = {
  t: Toast;
  variant: Variant;
  message: string;
  description?: string;
  duration: number;
};

function ToastCard({
  t,
  variant,
  message,
  description,
  duration,
}: ToastCardProps) {
  const s = styles[variant];
  const Icon = s.icon;
  const [running, setRunning] = useState(false);

  // Progress bar: left (0%) se right (100%) tak fill hoti hai
  useEffect(() => {
    const frame = requestAnimationFrame(() => setRunning(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      role={variant === "error" || variant === "deleted" ? "alert" : "status"}
      className={`pointer-events-auto relative w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border shadow-[0_12px_32px_-8px_rgba(15,23,42,0.22)] transition-all duration-200 ${s.card} ${
        t.visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${s.badge}`}
        >
          <Icon size={18} strokeWidth={2.4} />
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className={`text-sm font-semibold leading-5 ${s.title}`}>
            {message}
          </p>
          {description && (
            <p className={`mt-0.5 text-[13px] leading-5 ${s.desc}`}>
              {description}
            </p>
          )}
        </div>

        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => toast.dismiss(t.id)}
          className={`-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md !bg-transparent transition-colors ${s.close}`}
        >
          <X size={16} />
        </button>
      </div>

      <div className="h-1 w-full bg-black/5">
        <div
          className={`h-full ${s.bar}`}
          style={{
            width: running ? "100%" : "0%",
            transition: `width ${duration}ms linear`,
          }}
        />
      </div>
    </div>
  );
}

type Options = { duration?: number; id?: string };

function show(
  variant: Variant,
  message: string,
  description?: string,
  options?: Options
) {
  const duration = options?.duration ?? durations[variant];

  return toast.custom(
    (t) => (
      <ToastCard
        t={t}
        variant={variant}
        message={message}
        description={description}
        duration={duration}
      />
    ),
    {
      id: options?.id ?? `${variant}:${message}`,
      duration,
    }
  );
}

export const notify = {
  created: (message: string, description?: string, options?: Options) =>
    show("created", message, description, options),
  updated: (message: string, description?: string, options?: Options) =>
    show("updated", message, description, options),
  deleted: (message: string, description?: string, options?: Options) =>
    show("deleted", message, description, options),
  success: (message: string, description?: string, options?: Options) =>
    show("success", message, description, options),
  error: (message: string, description?: string, options?: Options) =>
    show("error", message, description, options),
  warning: (message: string, description?: string, options?: Options) =>
    show("warning", message, description, options),
  info: (message: string, description?: string, options?: Options) =>
    show("info", message, description, options),
  dismiss: (id?: string) => toast.dismiss(id),
};