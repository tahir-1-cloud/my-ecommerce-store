import { useId } from "react";

type SwitchFieldProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export default function SwitchField({
  label,
  description,
  checked,
  onChange,
  disabled,
}: SwitchFieldProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 has-[:checked]:border-indigo-200 has-[:checked]:bg-indigo-50/40"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        )}
      </div>

      <span className="relative inline-flex h-6 w-11 shrink-0">
        <input
          id={id}
          type="checkbox"
          role="switch"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />

        {/* Track */}
        <span className="absolute inset-0 rounded-full !border !border-slate-400 !bg-slate-300 shadow-inner transition-colors duration-200 peer-checked:!border-[#4338ca] peer-checked:!bg-[#4f46e5] peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-500/25 peer-disabled:opacity-60" />

        {/* Thumb */}
        <span className="pointer-events-none absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.4)] ring-1 ring-slate-300 transition-transform duration-200 peer-checked:translate-x-5 peer-checked:ring-0" />
      </span>
    </label>
  );
}