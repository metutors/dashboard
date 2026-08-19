"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  accent: "red" | "blue" | "violet" | "slate";
  defaultOpen?: boolean;
  headerExtra?: ReactNode;
  collapsedHint?: string;
  children: ReactNode;
}

const accentThemes = {
  red: {
    bar: "bg-rose-500",
    header: "from-rose-50/60 to-white",
    badge: "bg-rose-50 text-rose-700 ring-rose-100",
    chevron: "text-rose-500",
  },
  blue: {
    bar: "bg-sky-500",
    header: "from-sky-50/60 to-white",
    badge: "bg-sky-50 text-sky-700 ring-sky-100",
    chevron: "text-sky-500",
  },
  violet: {
    bar: "bg-violet-500",
    header: "from-violet-50/60 to-white",
    badge: "bg-violet-50 text-violet-700 ring-violet-100",
    chevron: "text-violet-500",
  },
  slate: {
    bar: "bg-slate-400",
    header: "from-slate-50/60 to-white",
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    chevron: "text-slate-500",
  },
} as const;

export function CollapsibleSection({
  title,
  description,
  accent,
  defaultOpen = true,
  headerExtra,
  collapsedHint,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const theme = accentThemes[accent];

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div
        className={`bg-gradient-to-r ${theme.header} ${
          open ? "border-b border-slate-100" : ""
        }`}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full select-none items-center gap-3 px-4 py-3.5 text-left outline-none transition hover:bg-white/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-200 sm:px-5"
        >
          <span
            className={`h-5 w-1 shrink-0 rounded-full ${theme.bar}`}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700">
              {title}
            </span>
            {description ? (
              <span className="mt-0.5 block truncate text-[11px] font-normal normal-case tracking-normal text-slate-500">
                {description}
              </span>
            ) : null}
          </div>
          {!open && collapsedHint ? (
            <span
              className={`max-w-[40%] shrink-0 truncate rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums ring-1 ring-inset ${theme.badge}`}
            >
              {collapsedHint}
            </span>
          ) : null}
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/80 shadow-sm ring-1 ring-slate-200/80 ${theme.chevron}`}
            aria-hidden
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                open ? "rotate-0" : "-rotate-90"
              }`}
            />
          </span>
        </button>

        {open && headerExtra ? (
          <div className="flex flex-col gap-3 border-t border-slate-100/80 bg-white/50 px-4 pb-3 pt-3 sm:flex-row sm:items-end sm:justify-start sm:px-5">
            {headerExtra}
          </div>
        ) : null}
      </div>

      {open ? (
        <div id={panelId} className="p-4 sm:p-5">
          {children}
        </div>
      ) : null}
    </section>
  );
}
