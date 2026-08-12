"use client";

import { SectionHeading } from "@/components/dashboard/SectionHeading";
import type { StatusCounts } from "@/types/jira";

type StatusTone = "green" | "blue" | "purple" | "orange" | "slate";

const valueClasses: Record<StatusTone, string> = {
  green: "text-emerald-600",
  blue: "text-sky-600",
  purple: "text-violet-600",
  orange: "text-orange-500",
  slate: "text-slate-400",
};

function StatusCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: StatusTone;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-2 text-[28px] font-extrabold leading-none tabular-nums ${valueClasses[tone]}`}
      >
        {value}
      </p>
    </article>
  );
}

interface StatusSectionProps {
  title: string;
  accent: "red" | "blue";
  counts: StatusCounts;
}

export function StatusSection({ title, accent, counts }: StatusSectionProps) {
  return (
    <section className="space-y-3">
      <SectionHeading title={title} accent={accent} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatusCard label="Done" value={counts.done} tone="green" />
        <StatusCard label="In Progress" value={counts.inProgress} tone="blue" />
        <StatusCard label="On Hold" value={counts.onHold} tone="purple" />
        <StatusCard
          label="Ready for QA"
          value={counts.readyForQA}
          tone="orange"
        />
        <StatusCard label="To Do" value={counts.todo} tone="slate" />
      </div>
    </section>
  );
}
