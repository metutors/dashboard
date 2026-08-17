"use client";

import {
  CheckCircle2,
  CircleDashed,
  ClipboardCheck,
  Loader,
  PauseCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/dashboard/SectionHeading";
import { STATUS_BUCKET_LABELS } from "@/lib/jira/constants";
import type { StatusCounts } from "@/types/jira";

type StatusTone = "green" | "blue" | "purple" | "orange" | "slate";

const valueClasses: Record<StatusTone, string> = {
  green: "text-emerald-600",
  blue: "text-sky-600",
  purple: "text-violet-600",
  orange: "text-orange-500",
  slate: "text-slate-400",
};

const iconClasses: Record<StatusTone, string> = {
  green: "text-emerald-200",
  blue: "text-sky-200",
  purple: "text-violet-200",
  orange: "text-orange-200",
  slate: "text-slate-200",
};

function StatusCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: StatusTone;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>
          <p
            className={`mt-2 text-[28px] font-extrabold leading-none tabular-nums ${valueClasses[tone]}`}
          >
            {value}
          </p>
        </div>
        <Icon className={`h-7 w-7 shrink-0 ${iconClasses[tone]}`} aria-hidden />
      </div>
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatusCard
          label="Done"
          value={counts.done}
          tone="green"
          icon={CheckCircle2}
        />
        <StatusCard
          label="In Progress"
          value={counts.inProgress}
          tone="blue"
          icon={Loader}
        />
        <StatusCard
          label="On Hold"
          value={counts.onHold}
          tone="purple"
          icon={PauseCircle}
        />
        <StatusCard
          label="Ready for QA"
          value={counts.readyForQA}
          tone="orange"
          icon={ClipboardCheck}
        />
        <StatusCard
          label={STATUS_BUCKET_LABELS.todo}
          value={counts.todo}
          tone="slate"
          icon={CircleDashed}
        />
      </div>
    </section>
  );
}
