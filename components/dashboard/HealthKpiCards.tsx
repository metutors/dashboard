"use client";

import { AlertTriangle, PauseCircle, RotateCcw, UserX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CollapsibleSection } from "@/components/dashboard/CollapsibleSection";
import type { HealthMetrics } from "@/types/jira";

type HealthTone = "amber" | "rose" | "violet" | "purple";

const labelClasses: Record<HealthTone, string> = {
  amber: "text-amber-700",
  rose: "text-rose-700",
  violet: "text-brand-dark",
  purple: "text-purple-700",
};

const valueClasses: Record<HealthTone, string> = {
  amber: "text-amber-600",
  rose: "text-rose-600",
  violet: "text-brand",
  purple: "text-purple-600",
};

const iconClasses: Record<HealthTone, string> = {
  amber: "text-amber-200",
  rose: "text-rose-200",
  violet: "text-brand/30",
  purple: "text-purple-200",
};

const borderClasses: Record<HealthTone, string> = {
  amber: "border-amber-200",
  rose: "border-rose-200",
  violet: "border-brand/30",
  purple: "border-purple-200",
};

function HealthCard({
  label,
  hint,
  value,
  tone,
  icon: Icon,
  highlight,
}: {
  label: string;
  hint: string;
  value: number;
  tone: HealthTone;
  icon: LucideIcon;
  highlight?: boolean;
}) {
  return (
    <article
      className={`rounded-xl border bg-white px-4 py-4 shadow-sm ${borderClasses[tone]} ${
        highlight && value > 0 ? "ring-2 ring-amber-300/60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.14em] ${labelClasses[tone]}`}
          >
            {label}
          </p>
          <p
            className={`mt-2 text-[28px] font-extrabold leading-none tabular-nums ${valueClasses[tone]}`}
          >
            {value}
          </p>
          <p className="mt-1.5 text-[11px] text-slate-500">{hint}</p>
        </div>
        <Icon className={`h-7 w-7 shrink-0 ${iconClasses[tone]}`} aria-hidden />
      </div>
    </article>
  );
}

export function HealthKpiCards({ health }: { health: HealthMetrics }) {
  const alerts =
    health.unassigned + health.stale30Days + health.reopened + health.onHold;

  return (
    <CollapsibleSection
      title="Health Indicators"
      description="Tickets that may need attention right now."
      accent="violet"
      collapsedHint={`${alerts} flagged`}
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <HealthCard
        label="Unassigned"
        hint="Tickets with no assignee"
        value={health.unassigned}
        tone="violet"
        icon={UserX}
      />
      <HealthCard
        label="Stale (30+ days)"
        hint="Open tickets older than 30 days"
        value={health.stale30Days}
        tone="amber"
        icon={AlertTriangle}
        highlight
      />
      <HealthCard
        label="Reopened"
        hint="Currently in Re-opened status"
        value={health.reopened}
        tone="rose"
        icon={RotateCcw}
      />
      <HealthCard
        label="On Hold"
        hint="Tickets paused or blocked"
        value={health.onHold}
        tone="purple"
        icon={PauseCircle}
      />
      </section>
    </CollapsibleSection>
  );
}
