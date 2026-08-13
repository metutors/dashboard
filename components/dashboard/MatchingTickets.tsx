"use client";

import { SectionHeading } from "@/components/dashboard/SectionHeading";
import type { DashboardIssueRow } from "@/types/jira";

function typeBadgeClasses(type: string): string {
  const normalized = type.trim().toLowerCase();
  if (normalized === "bug") {
    return "bg-rose-50 text-rose-700 ring-rose-200";
  }
  if (normalized === "task") {
    return "bg-sky-50 text-sky-700 ring-sky-200";
  }
  return "bg-slate-50 text-slate-600 ring-slate-200";
}

function statusBadgeClasses(status: string): string {
  const normalized = status.trim().toLowerCase();
  if (normalized === "in progress") {
    return "bg-teal-50 text-teal-700 ring-teal-200";
  }
  if (normalized === "done" || normalized === "closed" || normalized === "resolved") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }
  if (normalized === "on hold") {
    return "bg-violet-50 text-violet-700 ring-violet-200";
  }
  if (normalized === "ready for qa") {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }
  return "bg-slate-50 text-slate-600 ring-slate-200";
}

interface MatchingTicketsProps {
  issues: DashboardIssueRow[];
  total: number;
}

export function MatchingTickets({ issues, total }: MatchingTicketsProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <SectionHeading title="Matching Tickets" accent="violet" />
        <span className="text-[11px] font-semibold tabular-nums text-slate-500">
          {total} {total === 1 ? "ticket" : "tickets"}
        </span>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {issues.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-slate-500">
            No tickets match the current filters.
          </p>
        ) : (
          <div className="max-h-[480px] overflow-y-auto">
            <div className="sticky top-0 z-10 hidden grid-cols-[7.5rem_4.5rem_minmax(0,1fr)_7rem_9rem] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 md:grid">
              <span>Key</span>
              <span>Type</span>
              <span>Summary</span>
              <span>Status</span>
              <span>Assignee</span>
            </div>

            <ul className="divide-y divide-slate-100">
              {issues.map((issue) => (
                <li
                  key={issue.key}
                  className="grid grid-cols-1 gap-2 px-4 py-3 md:grid-cols-[7.5rem_4.5rem_minmax(0,1fr)_7rem_9rem] md:items-center md:gap-3"
                >
                  <a
                    href={issue.browseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit text-xs font-bold text-violet-700 hover:underline"
                  >
                    {issue.key}
                  </a>

                  <span
                    className={`w-fit rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${typeBadgeClasses(issue.type)}`}
                  >
                    {issue.type}
                  </span>

                  <p className="min-w-0 truncate text-xs text-slate-700" title={issue.summary}>
                    {issue.summary}
                  </p>

                  <span
                    className={`w-fit rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusBadgeClasses(issue.status)}`}
                  >
                    {issue.status}
                  </span>

                  <span className="truncate text-xs text-slate-500">
                    {issue.assignee ?? "Unassigned"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </section>
  );
}
