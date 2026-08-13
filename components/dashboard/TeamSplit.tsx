"use client";

import { ClipboardCheck, Monitor, Server } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/dashboard/SectionHeading";
import type { TeamSplit } from "@/types/jira";

type TeamTone = "violet" | "green" | "amber";

const labelClasses: Record<TeamTone, string> = {
  violet: "text-violet-700",
  green: "text-emerald-700",
  amber: "text-amber-700",
};

const valueClasses: Record<TeamTone, string> = {
  violet: "text-violet-600",
  green: "text-emerald-600",
  amber: "text-amber-600",
};

const iconClasses: Record<TeamTone, string> = {
  violet: "text-violet-200",
  green: "text-emerald-200",
  amber: "text-amber-200",
};

const borderClasses: Record<TeamTone, string> = {
  violet: "border-violet-200",
  green: "border-emerald-200",
  amber: "border-amber-200",
};

function TeamCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: TeamTone;
  icon: LucideIcon;
}) {
  return (
    <article
      className={`rounded-xl border bg-white px-5 py-4 shadow-sm ${borderClasses[tone]}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.14em] ${labelClasses[tone]}`}
          >
            {label}
          </p>
          <p
            className={`mt-2 text-[30px] font-extrabold leading-none tabular-nums ${valueClasses[tone]}`}
          >
            {value}
          </p>
        </div>
        <Icon className={`h-8 w-8 ${iconClasses[tone]}`} aria-hidden />
      </div>
    </article>
  );
}

export function TeamSplitSection({ teamSplit }: { teamSplit: TeamSplit }) {
  return (
    <section className="space-y-3">
      <SectionHeading title="Team Split" accent="violet" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TeamCard
          label={teamSplit.backendLabel}
          value={teamSplit.backend}
          tone="violet"
          icon={Server}
        />
        <TeamCard
          label={teamSplit.frontendLabel}
          value={teamSplit.frontend}
          tone="green"
          icon={Monitor}
        />
        <TeamCard
          label={teamSplit.qaLabel}
          value={teamSplit.qa}
          tone="amber"
          icon={ClipboardCheck}
        />
      </div>
    </section>
  );
}
