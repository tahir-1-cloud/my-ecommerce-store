import type { ElementType, ReactNode } from "react";

type SectionCardProps = {
  icon: ElementType;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export default function SectionCard({
  icon: Icon,
  title,
  description,
  action,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white font-sans shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100">
            <Icon size={19} strokeWidth={1.9} />
          </span>

          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-slate-500">{description}</p>
            )}
          </div>
        </div>

        {action}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}