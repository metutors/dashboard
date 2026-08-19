"use client";

import { ClipboardCheck, Monitor, Server, UserX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CollapsibleSection } from "@/components/dashboard/CollapsibleSection";
import type { TeamMemberStats, TeamSplit } from "@/types/jira";

type TeamTone = "violet" | "green" | "amber" | "slate";

const themes: Record<
  TeamTone,
  { card: string; role: string; value: string; icon: string; iconBg: string }
> = {
  violet: {
    card: "border-violet-200 bg-white",
    role: "text-violet-600",
    value: "text-violet-700",
    icon: "text-violet-500",
    iconBg: "bg-violet-50",
  },
  green: {
    card: "border-emerald-200 bg-white",
    role: "text-emerald-600",
    value: "text-emerald-700",
    icon: "text-emerald-500",
    iconBg: "bg-emerald-50",
  },
  amber: {
    card: "border-amber-200 bg-white",
    role: "text-amber-600",
    value: "text-amber-700",
    icon: "text-amber-500",
    iconBg: "bg-amber-50",
  },
  slate: {
    card: "border-slate-200 bg-white",
    role: "text-slate-500",
    value: "text-slate-800",
    icon: "text-slate-400",
    iconBg: "bg-slate-50",
  },
};

function parseTeamLabel(label: string): { role: string; name: string | null } {
  const parts = label.split("—").map((part) => part.trim());
  if (parts.length >= 2) {
    return { role: parts[0], name: parts.slice(1).join(" — ") };
  }
  return { role: label, name: null };
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function StatMini({
  value,
  label,
  valueClass,
  bgClass,
}: {
  value: number;
  label: string;
  valueClass: string;
  bgClass: string;
}) {
  return (
    <div className={`rounded-lg px-3 py-2 ${bgClass}`}>
      <p className={`text-lg font-bold tabular-nums leading-none ${valueClass}`}>
        {value}
      </p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
    </div>
  );
}

function TeamCard({
  label,
  stats,
  tone,
  icon: Icon,
}: {
  label: string;
  stats: TeamMemberStats;
  tone: TeamTone;
  icon: LucideIcon;
}) {
  const theme = themes[tone];
  const { role, name } = parseTeamLabel(label);

  return (
    <article
      className={`rounded-xl border px-5 py-4 shadow-sm ${theme.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.14em] ${theme.role}`}
          >
            {role}
          </p>
          {name ? (
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
              {toTitleCase(name)}
            </p>
          ) : null}
        </div>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${theme.iconBg}`}
        >
          <Icon className={`h-4 w-4 ${theme.icon}`} aria-hidden />
        </div>
      </div>

      <p
        className={`mt-4 text-[36px] font-extrabold leading-none tabular-nums ${theme.value}`}
      >
        {stats.total}
      </p>

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
        <div className="grid grid-cols-2 gap-2">
          <StatMini
            value={stats.bugs}
            label="Bugs"
            valueClass="text-rose-600"
            bgClass="bg-rose-50/80"
          />
          <StatMini
            value={stats.tasks}
            label="Tasks"
            valueClass="text-sky-600"
            bgClass="bg-sky-50/80"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatMini
            value={stats.open}
            label="Open"
            valueClass="text-amber-600"
            bgClass="bg-amber-50/80"
          />
          <StatMini
            value={stats.done}
            label="Done"
            valueClass="text-emerald-600"
            bgClass="bg-emerald-50/80"
          />
        </div>
      </div>
    </article>
  );
}

export function TeamSplitSection({ teamSplit }: { teamSplit: TeamSplit }) {
  const total =
    teamSplit.backend.total +
    teamSplit.frontend.total +
    teamSplit.qa.total +
    teamSplit.unassigned.total;

  return (
    <CollapsibleSection
      title="Team Split"
      description="Workload per person — bugs, tasks, open, and done."
      accent="violet"
      collapsedHint={`${total} tickets`}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TeamCard
          label={teamSplit.backendLabel}
          stats={teamSplit.backend}
          tone="violet"
          icon={Server}
        />
        <TeamCard
          label={teamSplit.frontendLabel}
          stats={teamSplit.frontend}
          tone="green"
          icon={Monitor}
        />
        <TeamCard
          label={teamSplit.qaLabel}
          stats={teamSplit.qa}
          tone="amber"
          icon={ClipboardCheck}
        />
        <TeamCard
          label="Unassigned"
          stats={teamSplit.unassigned}
          tone="slate"
          icon={UserX}
        />
      </div>
    </CollapsibleSection>
  );
}
