import { cacheDeleteByPrefix, cacheGet, cacheSet } from "./cache";
import { getBrowseUrl, getJiraConfig } from "./config";
import { DISPLAY_NAME_ALIASES, displayStatusName } from "./constants";
import {
  describeFilters,
  getFilterOptions,
  matchesFilters,
  resolveFilters,
} from "./filters";
import { buildProjectJql, getAllIssues } from "./issues";
import type {
  AverageCloseTime,
  DashboardData,
  DashboardFilters,
  DashboardIssueRow,
  HealthMetrics,
  JiraIssue,
  ResolvedIssue,
  StatusCounts,
  TeamMemberStats,
  TeamSplit,
} from "@/types/jira";

const ISSUES_CACHE_PREFIX = "jira:issues:";
const STALE_DAYS = 30;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function normalizeName(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function parseCsvList(values: string[]): Set<string> {
  return new Set(values.map((value) => normalizeName(value)));
}

function formatDateTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${day} ${month} ${year}, ${time}`;
}

function formatLastUpdated(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear();
  const time = date
    .toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();

  return `${day} ${month} ${year}, ${time}`;
}

function daysBetween(startIso: string, endIso: string): number | null {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
  return (end - start) / (1000 * 60 * 60 * 24);
}

function getIssueTypeName(issue: JiraIssue): string {
  return issue.fields.issuetype?.name?.trim() ?? "Unknown";
}

function getStatusName(issue: JiraIssue): string {
  return issue.fields.status?.name?.trim() ?? "Unknown";
}

function getAssigneeName(issue: JiraIssue): string | null {
  return issue.fields.assignee?.displayName?.trim() || null;
}

/** Maps Jira display names (e.g. Mubashar) to dashboard display names (Usman). */
function displayName(value: string | null): string | null {
  if (!value) return null;
  return DISPLAY_NAME_ALIASES[normalizeName(value)] ?? value;
}

function emptyStatusCounts(): StatusCounts {
  return {
    done: 0,
    inProgress: 0,
    onHold: 0,
    readyForQA: 0,
    todo: 0,
  };
}

function categorizeStatus(statusName: string): keyof StatusCounts | null {
  const { statusMapping } = getJiraConfig();
  const normalized = normalizeName(statusName);

  const entries: Array<[keyof StatusCounts, string[]]> = [
    ["done", statusMapping.done],
    ["inProgress", statusMapping.inProgress],
    ["onHold", statusMapping.onHold],
    ["readyForQA", statusMapping.readyForQA],
    ["todo", statusMapping.todo],
  ];

  for (const [key, aliases] of entries) {
    if (aliases.some((alias) => normalizeName(alias) === normalized)) {
      return key;
    }
  }

  return null;
}

function isBug(issue: JiraIssue): boolean {
  const type = normalizeName(getIssueTypeName(issue));
  return getJiraConfig().bugTypes.some(
    (name) => normalizeName(name) === type,
  );
}

function isTask(issue: JiraIssue): boolean {
  const type = normalizeName(getIssueTypeName(issue));
  return getJiraConfig().taskTypes.some(
    (name) => normalizeName(name) === type,
  );
}

function isDone(issue: JiraIssue): boolean {
  return categorizeStatus(getStatusName(issue)) === "done";
}

function isReopenedStatus(issue: JiraIssue): boolean {
  return normalizeName(getStatusName(issue)) === "re-opened";
}

function emptyTeamMemberStats(): TeamMemberStats {
  return { total: 0, bugs: 0, tasks: 0, open: 0, done: 0 };
}

function incrementTeamStats(stats: TeamMemberStats, issue: JiraIssue): void {
  stats.total += 1;
  if (isBug(issue)) stats.bugs += 1;
  if (isTask(issue)) stats.tasks += 1;
  if (isDone(issue)) {
    stats.done += 1;
  } else if (categorizeStatus(getStatusName(issue))) {
    stats.open += 1;
  }
}

function buildHealthMetrics(issues: JiraIssue[]): HealthMetrics {
  const now = Date.now();
  const staleThresholdMs = STALE_DAYS * MS_PER_DAY;
  let unassigned = 0;
  let stale30Days = 0;
  let reopened = 0;
  let onHold = 0;

  for (const issue of issues) {
    if (!getAssigneeName(issue)) {
      unassigned += 1;
    }

    if (isReopenedStatus(issue)) {
      reopened += 1;
    }

    const category = categorizeStatus(getStatusName(issue));
    if (category === "onHold") {
      onHold += 1;
    }

    if (category && category !== "done") {
      const created = issue.fields.created;
      if (created) {
        const age = now - new Date(created).getTime();
        if (age > staleThresholdMs) {
          stale30Days += 1;
        }
      }
    }
  }

  return { unassigned, stale30Days, reopened, onHold };
}

function buildStatusCounts(issues: JiraIssue[]): StatusCounts {
  const counts = emptyStatusCounts();
  for (const issue of issues) {
    const category = categorizeStatus(getStatusName(issue));
    if (category) counts[category] += 1;
  }
  return counts;
}

function buildTeamSplit(issues: JiraIssue[]): TeamSplit {
  const config = getJiraConfig();
  const backendUsers = parseCsvList(config.backendUsers);
  const frontendUsers = parseCsvList(config.frontendUsers);
  const qaUsers = parseCsvList(config.qaUsers);

  const backend = emptyTeamMemberStats();
  const frontend = emptyTeamMemberStats();
  const qa = emptyTeamMemberStats();
  const unassigned = emptyTeamMemberStats();

  for (const issue of issues) {
    const assignee = normalizeName(getAssigneeName(issue));
    if (!assignee) {
      incrementTeamStats(unassigned, issue);
      continue;
    }

    if (backendUsers.has(assignee)) {
      incrementTeamStats(backend, issue);
    } else if (frontendUsers.has(assignee)) {
      incrementTeamStats(frontend, issue);
    } else if (qaUsers.has(assignee)) {
      incrementTeamStats(qa, issue);
    }
  }

  return {
    backend,
    frontend,
    qa,
    unassigned,
    backendLabel: config.backendLabel,
    frontendLabel: config.frontendLabel,
    qaLabel: config.qaLabel,
  };
}

function buildResolvedIssues(issues: JiraIssue[]): ResolvedIssue[] {
  const resolved: ResolvedIssue[] = [];

  for (const issue of issues) {
    const created = issue.fields.created;
    const resolutiondate = issue.fields.resolutiondate;
    if (!created || !resolutiondate) continue;

    const days = daysBetween(created, resolutiondate);
    if (days == null) continue;

    resolved.push({
      key: issue.key,
      summary: issue.fields.summary,
      created: formatDateTime(created),
      resolved: formatDateTime(resolutiondate),
      daysToClose: Number(days.toFixed(1)),
      daysToCloseLabel: `${days.toFixed(1)}d`,
      browseUrl: getBrowseUrl(issue.key),
    });
  }

  return resolved.sort((a, b) => b.daysToClose - a.daysToClose);
}

function averageDays(issues: ResolvedIssue[]): number | null {
  if (issues.length === 0) return null;
  const total = issues.reduce((sum, issue) => sum + issue.daysToClose, 0);
  return Number((total / issues.length).toFixed(1));
}

function buildIssueRows(issues: JiraIssue[]): DashboardIssueRow[] {
  return issues.map((issue) => {
    const created = issue.fields.created ?? null;
    const resolved = issue.fields.resolutiondate ?? null;
    const days =
      created && resolved ? daysBetween(created, resolved) : null;

    return {
      key: issue.key,
      summary: issue.fields.summary,
      type: getIssueTypeName(issue),
      status: displayStatusName(getStatusName(issue)),
      statusBucket: categorizeStatus(getStatusName(issue)),
      assignee: displayName(getAssigneeName(issue)),
      created: formatDateTime(created),
      resolved: formatDateTime(resolved),
      daysToClose: days == null ? null : Number(days.toFixed(1)),
      daysToCloseLabel: days == null ? "" : `${days.toFixed(1)}d`,
      browseUrl: getBrowseUrl(issue.key),
    };
  });
}

async function loadAllProjectIssues(forceRefresh: boolean): Promise<JiraIssue[]> {
  const config = getJiraConfig();
  const cacheKey = `${ISSUES_CACHE_PREFIX}${config.projectKey}`;

  if (forceRefresh) {
    cacheDeleteByPrefix(ISSUES_CACHE_PREFIX);
  } else {
    const cached = cacheGet<JiraIssue[]>(cacheKey);
    if (cached) return cached;
  }

  const jql = buildProjectJql();
  const issues = await getAllIssues(jql);
  cacheSet(cacheKey, issues, config.cacheMinutes * 60 * 1000);
  return issues;
}

export function invalidateJiraCache(): void {
  cacheDeleteByPrefix(ISSUES_CACHE_PREFIX);
}

export async function getDashboardData(
  filters: DashboardFilters,
  options: { forceRefresh?: boolean } = {},
): Promise<DashboardData> {
  const config = getJiraConfig();
  const resolved = resolveFilters(filters);
  const allIssues = await loadAllProjectIssues(Boolean(options.forceRefresh));

  // Filtering runs over the cached project dataset, so changing a filter never
  // triggers another Jira request.
  const filtered = allIssues.filter((issue) => matchesFilters(issue, resolved));

  const bugs = filtered.filter(isBug);
  const tasks = filtered.filter(isTask);
  const resolvedBugs = buildResolvedIssues(bugs);
  const resolvedTasks = buildResolvedIssues(tasks);

  const averageCloseTime: AverageCloseTime = {
    bugs: averageDays(resolvedBugs),
    bugsCount: resolvedBugs.length,
    tasks: averageDays(resolvedTasks),
    tasksCount: resolvedTasks.length,
  };

  const now = new Date();

  return {
    success: true,
    projectName: config.projectName,
    projectKey: config.projectKey,
    lastUpdated: now.toISOString(),
    lastUpdatedFormatted: formatLastUpdated(now),
    filters: {
      people: resolved.people?.id ?? null,
      peopleLabel: resolved.people?.label ?? null,
      module: resolved.module?.id ?? null,
      moduleLabel: resolved.module?.label ?? null,
      subModule: resolved.subModule?.id ?? null,
      subModuleLabel: resolved.subModule?.label ?? null,
      active: Boolean(resolved.people || resolved.module),
      options: getFilterOptions(),
      behavior: describeFilters(resolved),
    },
    total: filtered.length,
    bugs: bugs.length,
    tasks: tasks.length,
    bugStatus: buildStatusCounts(bugs),
    taskStatus: buildStatusCounts(tasks),
    teamSplit: buildTeamSplit(filtered),
    health: buildHealthMetrics(filtered),
    averageCloseTime,
    resolvedBugs,
    resolvedTasks,
    issues: buildIssueRows(filtered),
  };
}
