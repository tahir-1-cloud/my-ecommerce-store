"use client";

import { useEffect, useId } from "react";
import { AlertTriangle, X } from "lucide-react";

import Button from "@/app/admin/components/ui/Button";
import IconButton from "@/app/admin/components/ui/IconButton";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const messageId = useId();

  // Dialog khulne par body scroll lock
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className="my-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.25)] ring-1 ring-slate-200"
      >
        <div className="flex items-start gap-4 px-6 pb-5 pt-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-inset ring-red-100">
            <AlertTriangle size={21} strokeWidth={1.9} />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h2
              id={titleId}
              className="text-base font-semibold text-slate-900"
            >
              {title}
            </h2>

            <p
              id={messageId}
              className="mt-1.5 text-sm leading-6 text-slate-500"
            >
              {message}
            </p>
          </div>

          <IconButton
            label="Close dialog"
            icon={<X size={19} />}
            onClick={onCancel}
            disabled={loading}
            className="-mr-2 -mt-1"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>

          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {loading ? "Deleting..." : confirmText}
          </Button>
        </div>
      </section>
    </div>
  );
}