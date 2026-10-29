"use client";

import { useEffect, useId } from "react";
import { X } from "lucide-react";

import IconButton from "./IconButton";

type ImagePreviewModalProps = {
  src: string;
  title: string;
  onClose: () => void;
};

export default function ImagePreviewModal({
  src,
  title,
  onClose,
}: ImagePreviewModalProps) {
  const titleId = useId();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.25)] ring-1 ring-slate-200"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-3.5">
          <h2
            id={titleId}
            className="truncate text-base font-semibold text-slate-900"
          >
            {title}
          </h2>
          <IconButton label="Close" icon={<X size={19} />} onClick={onClose} />
        </div>

        <div className="flex items-center justify-center bg-slate-50 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={title}
            className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
          />
        </div>
      </div>
    </div>
  );
}