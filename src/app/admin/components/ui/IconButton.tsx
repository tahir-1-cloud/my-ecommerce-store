import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "default" | "primary" | "danger";
type Size = "sm" | "md";

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "title"
> & {
  label: string;
  icon: ReactNode;
  tone?: Tone;
  size?: Size;
};

const base =
  "inline-flex shrink-0 items-center justify-center rounded-lg !border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 active:scale-95 disabled:pointer-events-none disabled:opacity-50";

const tones: Record<Tone, string> = {
  default:
    "!border-slate-200 !bg-white !text-slate-600 hover:!border-slate-300 hover:!bg-slate-100 hover:!text-slate-900 focus-visible:ring-slate-400/25",
  primary:
    "!border-indigo-100 !bg-indigo-50 !text-indigo-600 hover:!border-[#4338ca] hover:!bg-[#4f46e5] hover:!text-white focus-visible:ring-indigo-500/25",
  danger:
    "!border-red-100 !bg-red-50 !text-red-600 hover:!border-[#b91c1c] hover:!bg-[#dc2626] hover:!text-white focus-visible:ring-red-500/25",
};

const sizes: Record<Size, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      label,
      icon,
      tone = "default",
      size = "md",
      className = "",
      type = "button",
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        title={label}
        aria-label={label}
        className={`${base} ${tones[tone]} ${sizes[size]} ${className}`}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

export default IconButton;