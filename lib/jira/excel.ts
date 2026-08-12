import ExcelJS from "exceljs";
import type { DashboardData } from "@/types/jira";

export async function buildDashboardWorkbook(
  data: DashboardData,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ME Tutors Live Dashboard";
  workbook.created = new Date();

  const summary = workbook.addWorksheet("Summary");
  summary.columns = [
    { header: "Metric", key: "metric", width: 36 },
    { header: "Value", key: "value", width: 28 },
  ];

  const summaryRows: Array<{ metric: string; value: string | number }> = [
    { metric: "Project", value: data.projectName },
    { metric: "Project Key", value: data.projectKey },
    { metric: "Last Updated", value: data.lastUpdatedFormatted },
    { metric: "Filter Behavior", value: data.filters.behavior },
    { metric: "People Filter", value: data.filters.people ?? "All" },
    { metric: "Module Filter", value: data.filters.module ?? "All" },
    { metric: "Total Matching Tickets", value: data.total },
    { metric: "Bugs", value: data.bugs },
    { metric: "Tasks", value: data.tasks },
    { metric: "Bug Status — Done", value: data.bugStatus.done },
    { metric: "Bug Status — In Progress", value: data.bugStatus.inProgress },
    { metric: "Bug Status — On Hold", value: data.bugStatus.onHold },
    { metric: "Bug Status — Ready for QA", value: data.bugStatus.readyForQA },
    { metric: "Bug Status — To Do", value: data.bugStatus.todo },
    { metric: "Task Status — Done", value: data.taskStatus.done },
    { metric: "Task Status — In Progress", value: data.taskStatus.inProgress },
    { metric: "Task Status — On Hold", value: data.taskStatus.onHold },
    {
      metric: "Task Status — Ready for QA",
      value: data.taskStatus.readyForQA,
    },
    { metric: "Task Status — To Do", value: data.taskStatus.todo },
    { metric: data.teamSplit.backendLabel, value: data.teamSplit.backend },
    { metric: data.teamSplit.frontendLabel, value: data.teamSplit.frontend },
    { metric: "OTHER", value: data.teamSplit.other },
    {
      metric: "Avg Time to Close — Bug (days)",
      value: data.averageCloseTime.bugs ?? "N/A",
    },
    {
      metric: "Resolved Bugs Count",
      value: data.averageCloseTime.bugsCount,
    },
    {
      metric: "Avg Time to Close — Task (days)",
      value: data.averageCloseTime.tasks ?? "N/A",
    },
    {
      metric: "Resolved Tasks Count",
      value: data.averageCloseTime.tasksCount,
    },
  ];

  summary.addRows(summaryRows);
  summary.getRow(1).font = { bold: true };

  const issues = workbook.addWorksheet("Issues");
  issues.columns = [
    { header: "Issue Key", key: "key", width: 16 },
    { header: "Summary", key: "summary", width: 60 },
    { header: "Type", key: "type", width: 12 },
    { header: "Status", key: "status", width: 16 },
    { header: "Assignee", key: "assignee", width: 24 },
    { header: "Created", key: "created", width: 22 },
    { header: "Resolved", key: "resolved", width: 22 },
    { header: "Time to Close", key: "daysToCloseLabel", width: 14 },
  ];

  for (const issue of data.issues) {
    issues.addRow({
      key: issue.key,
      summary: issue.summary,
      type: issue.type,
      status: issue.status,
      assignee: issue.assignee ?? "Unassigned",
      created: issue.created ?? "",
      resolved: issue.resolved ?? "",
      daysToCloseLabel: issue.daysToCloseLabel,
    });
  }

  issues.getRow(1).font = { bold: true };

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
