import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "default" | "primary" | "danger";

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "title"
> & {
  label: string;
  icon: ReactNode;
  tone?: Tone;
};

const tones: Record<Tone, string> = {
  default: "hover:bg-slate-100 hover:text-slate-900",
  primary: "hover:bg-indigo-50 hover:text-indigo-600",
  danger: "hover:bg-red-50 hover:text-red-600",
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { label, icon, tone = "default", className = "", type = "button", ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        title={label}
        aria-label={label}
        className={`flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 disabled:pointer-events-none disabled:opacity-50 ${tones[tone]} ${className}`}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

export default IconButton;