"use client";

import { Bug, ClipboardList } from "lucide-react";
import { CollapsibleSection } from "@/components/dashboard/CollapsibleSection";
import type { ResolvedIssue } from "@/types/jira";

type Tone = "bug" | "task";

const toneStyles: Record<
  Tone,
  {
    border: string;
    label: string;
    value: string;
    key: string;
    icon: string;
  }
> = {
  bug: {
    border: "border-rose-200",
    label: "text-rose-600",
    value: "text-rose-600",
    key: "text-rose-600",
    icon: "text-rose-300",
  },
  task: {
    border: "border-sky-200",
    label: "text-sky-600",
    value: "text-sky-600",
    key: "text-sky-600",
    icon: "text-sky-300",
  },
};

interface AverageCloseTimeCardProps {
  title: string;
  tone: Tone;
  days: number | null;
  count: number;
  countLabel: string;
  issues: ResolvedIssue[];
}

export function AverageCloseTimeCard({
  title,
  tone,
  days,
  count,
  countLabel,
  issues,
}: AverageCloseTimeCardProps) {
  const styles = toneStyles[tone];
  const Icon = tone === "bug" ? Bug : ClipboardList;

  return (
    <CollapsibleSection
      title={title}
      accent={tone === "bug" ? "red" : "blue"}
      collapsedHint={
        days == null ? `${count} ${countLabel}` : `${days.toFixed(1)}d avg · ${count}`
      }
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={`text-[10px] font-bold uppercase tracking-[0.14em] ${styles.label}`}
            >
              Average
            </p>
            <p
              className={`mt-2 text-[34px] font-extrabold leading-none tabular-nums ${styles.value}`}
            >
              {days == null ? "—" : `${days.toFixed(1)}d`}
            </p>
            <p className="mt-1.5 text-xs text-slate-500">
              based on {count} {countLabel}
            </p>
          </div>
          <Icon className={`h-9 w-9 ${styles.icon}`} aria-hidden />
        </div>

      {issues.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-4 py-4 text-xs text-slate-500">
          No resolved issues found for the current filters.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-100">
          <div className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
            {issues.map((issue) => (
              <div
                key={issue.key}
                className="flex items-center gap-3 py-2.5 text-sm"
              >
                <a
                  href={issue.browseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-28 shrink-0 text-xs font-bold hover:underline ${styles.key}`}
                >
                  {issue.key}
                </a>
                <span className="min-w-0 flex-1 truncate text-xs text-slate-600">
                  {issue.summary}
                </span>
                <span className="hidden shrink-0 text-[11px] text-slate-400 xl:block">
                  {issue.created ?? "—"} → {issue.resolved ?? "—"}
                </span>
                <span className="w-14 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-600">
                  {issue.daysToCloseLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </CollapsibleSection>
  );
}
