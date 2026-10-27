"use client";

import { useEffect, useId } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

import IconButton from "./IconButton";

type ModalProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  onClose: () => void;
  closeDisabled?: boolean;
  size?: "md" | "lg" | "xl";
  children: ReactNode;
};

const sizes = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  title,
  description,
  icon,
  onClose,
  closeDisabled = false,
  size = "lg",
  children,
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`my-auto w-full ${sizes[size]} overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.25)] ring-1 ring-slate-200`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100">
                {icon}
              </div>
            )}

            <div>
              <h2
                id={titleId}
                className="text-base font-semibold text-slate-900"
              >
                {title}
              </h2>
              {description && (
                <p className="mt-0.5 text-sm text-slate-500">{description}</p>
              )}
            </div>
          </div>

          <IconButton
            label="Close"
            icon={<X size={19} />}
            onClick={onClose}
            disabled={closeDisabled}
          />
        </div>

        {children}
      </div>
    </div>
  );
}