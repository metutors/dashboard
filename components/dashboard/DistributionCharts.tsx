"use client";

import { PieCard, type PieSlice } from "@/components/dashboard/PieCard";
import { CollapsibleSection } from "@/components/dashboard/CollapsibleSection";
import { STATUS_BUCKET_LABELS } from "@/lib/jira/constants";
import type { DashboardData } from "@/types/jira";

const CHART_COLORS = {
  bugs: "#e11d48",
  tasks: "#0284c7",
  done: "#059669",
  inProgress: "#0284c7",
  onHold: "#3bb3c1",
  readyForQA: "#ff8e18",
  todo: "#94a3b8",
  backend: "#2b8d99",
  frontend: "#059669",
  qa: "#d97706",
} as const;

function statusSlices(counts: DashboardData["bugStatus"]): PieSlice[] {
  return [
    { name: "Done", value: counts.done, color: CHART_COLORS.done },
    {
      name: "In Progress",
      value: counts.inProgress,
      color: CHART_COLORS.inProgress,
    },
    { name: "On Hold", value: counts.onHold, color: CHART_COLORS.onHold },
    {
      name: "Ready for QA",
      value: counts.readyForQA,
      color: CHART_COLORS.readyForQA,
    },
    {
      name: STATUS_BUCKET_LABELS.todo,
      value: counts.todo,
      color: CHART_COLORS.todo,
    },
  ];
}

function shortTeamLabel(label: string): string {
  return label.split("—")[0]?.trim() || label;
}

export function DistributionCharts({ data }: { data: DashboardData }) {
  const typeSlices: PieSlice[] = [
    { name: "Bugs", value: data.bugs, color: CHART_COLORS.bugs },
    { name: "Tasks", value: data.tasks, color: CHART_COLORS.tasks },
  ];

  const teamSlices: PieSlice[] = [
    {
      name: shortTeamLabel(data.teamSplit.backendLabel),
      value: data.teamSplit.backend.total,
      color: CHART_COLORS.backend,
    },
    {
      name: shortTeamLabel(data.teamSplit.frontendLabel),
      value: data.teamSplit.frontend.total,
      color: CHART_COLORS.frontend,
    },
    {
      name: shortTeamLabel(data.teamSplit.qaLabel),
      value: data.teamSplit.qa.total,
      color: CHART_COLORS.qa,
    },
    ...(data.teamSplit.unassigned.total > 0
      ? [
          {
            name: "Unassigned",
            value: data.teamSplit.unassigned.total,
            color: CHART_COLORS.todo,
          },
        ]
      : []),
  ];

  return (
    <CollapsibleSection
      title="Visual Breakdown"
      description="How tickets split by type, status, and team."
      accent="violet"
      collapsedHint={`${data.total} tickets`}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PieCard
          title="Bugs vs Tasks"
          centerLabel="Tickets"
          slices={typeSlices}
        />
        <PieCard
          title="Bug Status"
          centerLabel="Bugs"
          slices={statusSlices(data.bugStatus)}
        />
        <PieCard
          title="Task Status"
          centerLabel="Tasks"
          slices={statusSlices(data.taskStatus)}
        />
        <PieCard
          title="Team Split"
          centerLabel="Tickets"
          slices={teamSlices}
        />
      </div>
    </CollapsibleSection>
  );
}
