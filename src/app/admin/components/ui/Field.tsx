import { forwardRef, useId } from "react";
import type {
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { AlertCircle, ChevronDown } from "lucide-react";

const RED = "#dc2626";
const MUTED = "#94a3b8";

const controlBase =
  "w-full rounded-xl !border px-3.5 py-2.5 text-sm text-slate-900 !outline-none transition-colors duration-150 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:!bg-slate-50 disabled:opacity-60";

const controlNormal =
  "!border-slate-300 !bg-white hover:!border-slate-400 focus:!border-indigo-500 focus:ring-4 focus:ring-indigo-500/15";

const controlInvalid = "focus:ring-4 focus:ring-red-500/15";

export const controlClass = (invalid?: boolean) =>
  `${controlBase} ${invalid ? controlInvalid : controlNormal}`;

/** Error par red border + halka red background (inline, override nahi hota) */
export const invalidStyle = (invalid?: boolean): CSSProperties | undefined =>
  invalid
    ? { borderColor: "#ef4444", backgroundColor: "#fef2f2" }
    : undefined;

const isFilled = (value: unknown) => String(value ?? "").trim() !== "";

export function FieldError({
  id,
  message,
}: {
  id?: string;
  message?: string;
}) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className="flex items-center gap-1.5 text-xs font-medium"
      style={{ color: RED }}
    >
      <AlertCircle size={13} className="shrink-0" style={{ color: RED }} />
      {message}
    </p>
  );
}

type FieldShellProps = {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  filled?: boolean;
  children: ReactNode;
};

function FieldShell({
  id,
  label,
  required,
  optional,
  hint,
  error,
  filled,
  children,
}: FieldShellProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required && (
          <span
            className="ml-0.5"
            style={{ color: filled && !error ? MUTED : RED }}
            aria-hidden="true"
          >
            *
          </span>
        )}
        {optional && (
          <span className="ml-2 font-normal text-slate-400">(Optional)</span>
        )}
      </label>

      {children}

      {error ? (
        <FieldError id={`${id}-error`} message={error} />
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

type SharedProps = {
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
};

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & SharedProps
>(function Input(
  { label, optional, hint, error, required, className = "", style, id, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <FieldShell
      id={inputId}
      label={label}
      required={required}
      optional={optional}
      hint={hint}
      error={error}
      filled={isFilled(props.value)}
    >
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`${controlClass(!!error)} ${className}`}
        style={{ ...invalidStyle(!!error), ...style }}
        {...props}
      />
    </FieldShell>
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & SharedProps
>(function Textarea(
  { label, optional, hint, error, required, className = "", style, id, ...props },
  ref
) {
  const autoId = useId();
  const textareaId = id ?? autoId;

  return (
    <FieldShell
      id={textareaId}
      label={label}
      required={required}
      optional={optional}
      hint={hint}
      error={error}
      filled={isFilled(props.value)}
    >
      <textarea
        ref={ref}
        id={textareaId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        className={`${controlClass(!!error)} resize-y ${className}`}
        style={{ ...invalidStyle(!!error), ...style }}
        {...props}
      />
    </FieldShell>
  );
});

export type SelectOption = { label: string; value: string };

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> &
    SharedProps & { options: SelectOption[]; placeholder?: string }
>(function Select(
  {
    label,
    optional,
    hint,
    error,
    required,
    options,
    placeholder,
    className = "",
    style,
    id,
    ...props
  },
  ref
) {
  const autoId = useId();
  const selectId = id ?? autoId;

  return (
    <FieldShell
      id={selectId}
      label={label}
      required={required}
      optional={optional}
      hint={hint}
      error={error}
      filled={isFilled(props.value)}
    >
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={`${controlClass(!!error)} appearance-none pr-10 ${className}`}
          style={{ ...invalidStyle(!!error), ...style }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </FieldShell>
  );
});

export const Checkbox = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    label: string;
    hint?: string;
  }
>(function Checkbox({ label, hint, className = "", id, ...props }, ref) {
  const autoId = useId();
  const checkboxId = id ?? autoId;

  return (
    <div className="space-y-1">
      <label
        htmlFor={checkboxId}
        className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700"
      >
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={`h-4 w-4 rounded border-slate-300 accent-[#4f46e5] ${className}`}
          {...props}
        />
        {label}
      </label>
      {hint && <p className="pl-[26px] text-xs text-slate-500">{hint}</p>}
    </div>
  );
});