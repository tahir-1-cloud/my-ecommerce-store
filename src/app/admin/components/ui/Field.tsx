import { forwardRef, useId } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

const controlClass =
  "w-full rounded-xl !border !border-slate-300 !bg-white px-3.5 py-2.5 text-sm text-slate-900 !outline-none transition-colors duration-150 placeholder:text-slate-400 hover:!border-slate-400 focus:!border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 disabled:cursor-not-allowed disabled:!bg-slate-50 disabled:opacity-60";

type FieldShellProps = {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  children: ReactNode;
};

function FieldShell({
  id,
  label,
  required,
  optional,
  hint,
  children,
}: FieldShellProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
        {optional && (
          <span className="ml-2 font-normal text-slate-400">(Optional)</span>
        )}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

type SharedProps = {
  label: string;
  optional?: boolean;
  hint?: string;
};

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & SharedProps
>(function Input(
  { label, optional, hint, required, className = "", id, ...props },
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
    >
      <input
        ref={ref}
        id={inputId}
        required={required}
        className={`${controlClass} ${className}`}
        {...props}
      />
    </FieldShell>
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & SharedProps
>(function Textarea(
  { label, optional, hint, required, className = "", id, ...props },
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
    >
      <textarea
        ref={ref}
        id={textareaId}
        required={required}
        className={`${controlClass} resize-y ${className}`}
        {...props}
      />
    </FieldShell>
  );
});