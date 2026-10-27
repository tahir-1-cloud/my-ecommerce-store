"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 2;

type ImageUploadProps = {
  label: string;
  optional?: boolean;
  hint?: string;
  file: File | null;
  existingUrl?: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  onError: (message: string) => void;
  disabled?: boolean;
};

export default function ImageUpload({
  label,
  optional,
  hint,
  file,
  existingUrl,
  onSelect,
  onRemove,
  onError,
  disabled = false,
}: ImageUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const objectUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const preview = objectUrl ?? existingUrl ?? null;

  const handleFile = (selected?: File | null) => {
    if (!selected) return;

    if (!ACCEPTED.includes(selected.type)) {
      onError("Only JPG, PNG or WEBP images are allowed.");
      return;
    }
    if (selected.size > MAX_MB * 1024 * 1024) {
      onError(`Image must be smaller than ${MAX_MB}MB.`);
      return;
    }
    onSelect(selected);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    handleFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {optional && (
          <span className="ml-2 font-normal text-slate-400">(Optional)</span>
        )}
      </label>

      {preview ? (
        <div className="flex items-center gap-4 rounded-xl border border-slate-300 bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Category preview"
            className="h-20 w-20 shrink-0 rounded-lg border border-slate-200 object-cover"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">
              {file ? file.name : "Current image"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {file ? `${(file.size / 1024).toFixed(0)} KB` : "Saved image"}
            </p>

            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                Change
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={onRemove}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 size={13} />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragging
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50"
          } ${disabled ? "pointer-events-none opacity-60" : ""}`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100">
            <ImagePlus size={21} strokeWidth={1.9} />
          </span>
          <span className="text-sm font-medium text-slate-700">
            <span className="text-indigo-600">Click to upload</span> or drag
            and drop
          </span>
          <span className="text-xs text-slate-500">
            JPG, PNG or WEBP (max {MAX_MB}MB)
          </span>
        </label>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED.join(",")}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}