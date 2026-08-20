"use client";

import { useMemo, useState } from "react";
import { Bug, ListFilter, Search } from "lucide-react";
import { CollapsibleSection } from "@/components/dashboard/CollapsibleSection";
import { MultiSelectFilterDropdown } from "@/components/dashboard/MultiSelectFilterDropdown";
import { STATUS_FILTER_OPTIONS } from "@/lib/jira/constants";
import type { DashboardIssueRow, StatusCounts } from "@/types/jira";

const TABLE_HEIGHT_CLASS = "h-[480px]";

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
    return "bg-brand-light text-brand-dark ring-brand/30";
  }
  if (normalized === "ready for qa") {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }
  if (normalized === "re-opened" || normalized === "reopened") {
    return "bg-rose-50 text-rose-700 ring-rose-200";
  }
  return "bg-slate-50 text-slate-600 ring-slate-200";
}

function normalizeType(type: string): string {
  return type.trim().toLowerCase();
}

const statusFilterOptions = STATUS_FILTER_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

const typeFilterOptions = [
  { value: "bug", label: "Bug" },
  { value: "task", label: "Task" },
];

interface MatchingTicketsProps {
  issues: DashboardIssueRow[];
  total: number;
}

export function MatchingTickets({ issues, total }: MatchingTicketsProps) {
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIssues = useMemo(() => {
    let results = issues;

    if (statusFilters.length > 0) {
      const selected = new Set(statusFilters as Array<keyof StatusCounts>);
      results = results.filter(
        (issue) => issue.statusBucket != null && selected.has(issue.statusBucket),
      );
    }

    if (typeFilters.length > 0) {
      const selected = new Set(typeFilters);
      results = results.filter((issue) =>
        selected.has(normalizeType(issue.type)),
      );
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      results = results.filter(
        (issue) =>
          issue.key.toLowerCase().includes(query) ||
          issue.summary.toLowerCase().includes(query),
      );
    }

    return results;
  }, [issues, searchQuery, statusFilters, typeFilters]);

  const hasActiveFilters =
    statusFilters.length > 0 ||
    typeFilters.length > 0 ||
    searchQuery.trim().length > 0;

  const ticketCountLabel = hasActiveFilters
    ? `${filteredIssues.length} of ${total} tickets`
    : `${total} ${total === 1 ? "ticket" : "tickets"}`;

  const emptyMessage =
    issues.length === 0
      ? "No tickets match the current filters."
      : "No tickets match your search or filters. Try different options or clear the filters.";

  return (
    <CollapsibleSection
      title="Matching Tickets"
      description="All tickets matching your current filters."
      accent="violet"
      collapsedHint={ticketCountLabel}
      headerExtra={
        <div className="flex w-full min-h-[4.25rem] flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-sm md:shrink-0">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand">
              Search
            </p>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search key or summary..."
                aria-label="Search tickets by key or summary"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-end md:w-auto md:shrink-0">
            <MultiSelectFilterDropdown
              label="Type"
              icon={Bug}
              placeholder="All Types"
              options={typeFilterOptions}
              selected={typeFilters}
              onChange={setTypeFilters}
              selectedCountLabel="types"
              className="w-full sm:w-44"
            />

            <MultiSelectFilterDropdown
              label="Status"
              icon={ListFilter}
              placeholder="All Statuses"
              options={statusFilterOptions}
              selected={statusFilters}
              onChange={setStatusFilters}
              selectedCountLabel="statuses"
              className="w-full sm:w-52"
            />

            <span className="w-full shrink-0 pb-2.5 text-right text-[11px] font-semibold tabular-nums text-slate-500 sm:w-28">
              {ticketCountLabel}
            </span>
          </div>
        </div>
      }
    >
      <div
        className={`flex ${TABLE_HEIGHT_CLASS} flex-col overflow-hidden rounded-lg border border-slate-100`}
      >
        <div className="hidden shrink-0 grid-cols-[7.5rem_4.5rem_minmax(0,1fr)_7rem_9rem] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 md:grid">
          <span>Key</span>
          <span>Type</span>
          <span>Summary</span>
          <span>Status</span>
          <span>Assignee</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto transition-opacity duration-150">
          {filteredIssues.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4 py-6">
              <p className="text-center text-xs text-slate-500">{emptyMessage}</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredIssues.map((issue) => (
                <li
                  key={issue.key}
                  className="grid grid-cols-1 gap-2 px-4 py-3 md:grid-cols-[7.5rem_4.5rem_minmax(0,1fr)_7rem_9rem] md:items-center md:gap-3"
                >
                  <a
                    href={issue.browseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit text-xs font-bold text-brand-dark hover:underline"
                  >
                    {issue.key}
                  </a>

                  <span
                    className={`w-fit rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${typeBadgeClasses(issue.type)}`}
                  >
                    {issue.type}
                  </span>

                  <p
                    className="min-w-0 truncate text-xs text-slate-700"
                    title={issue.summary}
                  >
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
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
}
