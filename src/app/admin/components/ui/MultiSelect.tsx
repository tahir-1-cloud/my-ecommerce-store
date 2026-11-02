"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

import { controlClass, FieldError, invalidStyle } from "./Field";

export type MultiSelectOption<T extends string | number> = {
  label: string;
  value: T;
};

type MultiSelectProps<T extends string | number> = {
  label: string;
  options: MultiSelectOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  placeholder?: string;
  emptyText?: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
};

export default function MultiSelect<T extends string | number>({
  label,
  options,
  value,
  onChange,
  placeholder = "Select options",
  emptyText = "No options available.",
  required,
  optional,
  hint,
  error,
  disabled,
}: MultiSelectProps<T>) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const selected = options.filter((option) => value.includes(option.value));
  const filled = value.length > 0;

  const toggle = (optionValue: T) =>
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue]
    );

  return (
    <div ref={rootRef} className="relative space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required && (
          <span
            className="ml-0.5"
            style={{ color: filled && !error ? "#94a3b8" : "#dc2626" }}
            aria-hidden="true"
          >
            *
          </span>
        )}
        {optional && (
          <span className="ml-2 font-normal text-slate-400">(Optional)</span>
        )}
      </label>

      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        style={invalidStyle(!!error)}
        onClick={() => setOpen((current) => !current)}
        className={`${controlClass(!!error)} flex items-center justify-between gap-3 text-left`}
      >
        <span
          className={`truncate ${
            selected.length ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {selected.length
            ? selected.map((item) => item.label).join(", ")
            : placeholder}
        </span>
        <ChevronDown
          size={17}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl bg-white p-1.5 shadow-[0_16px_44px_rgba(15,23,42,0.16)] ring-1 ring-slate-200"
        >
          {options.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-slate-500">{emptyText}</p>
          ) : (
            options.map((option) => {
              const checked = value.includes(option.value);

              return (
                <label
                  key={String(option.value)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    checked
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => toggle(option.value)}
                  />
                  <span className="truncate">{option.label}</span>
                  {checked && <Check size={16} className="shrink-0" />}
                </label>
              );
            })
          )}
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-0.5">
          {selected.map((item) => (
            <span
              key={String(item.value)}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 py-1 pl-2.5 pr-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100"
            >
              {item.label}
              <button
                type="button"
                disabled={disabled}
                aria-label={`Remove ${item.label}`}
                onClick={() => toggle(item.value)}
                className="flex h-4 w-4 items-center justify-center rounded !bg-transparent !p-0 !text-indigo-500 transition-colors hover:!bg-indigo-100 hover:!text-indigo-800"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}

      {error ? (
        <FieldError id={`${id}-error`} message={error} />
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}