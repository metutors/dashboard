import { cacheDeleteByPrefix, cacheGet, cacheSet } from "./cache";
import { getBrowseUrl, getJiraConfig } from "./config";
import { buildProjectJql, getAllIssues } from "./issues";
import type {
  AverageCloseTime,
  DashboardData,
  DashboardFilters,
  DashboardIssueRow,
  DashboardFilterOptions,
  JiraIssue,
  ResolvedIssue,
  StatusCounts,
  TeamSplit,
} from "@/types/jira";

const ISSUES_CACHE_PREFIX = "jira:issues:";

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

function getCustomFieldValues(issue: JiraIssue, fieldId: string): string[] {
  const raw = issue.fields[fieldId];
  if (raw == null) return [];

  if (typeof raw === "string" || typeof raw === "number") {
    return [String(raw)];
  }

  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string" || typeof item === "number") {
          return String(item);
        }
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          if (typeof record.value === "string") return record.value;
          if (typeof record.name === "string") return record.name;
          if (typeof record.displayName === "string") return record.displayName;
        }
        return null;
      })
      .filter((value): value is string => Boolean(value));
  }

  if (typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    if (typeof record.value === "string") return [record.value];
    if (typeof record.name === "string") return [record.name];
    if (typeof record.displayName === "string") return [record.displayName];
  }

  return [];
}

function getPeopleValues(issue: JiraIssue): string[] {
  const config = getJiraConfig();
  if (config.ticketSourceField) {
    return getCustomFieldValues(issue, config.ticketSourceField);
  }
  const assignee = getAssigneeName(issue);
  return assignee ? [assignee] : [];
}

function getModuleValues(issue: JiraIssue): string[] {
  const config = getJiraConfig();
  if (config.moduleField) {
    return getCustomFieldValues(issue, config.moduleField);
  }

  const components = (issue.fields.components ?? []).map((c) => c.name);
  const labels = issue.fields.labels ?? [];
  const combined = [...components, ...labels];

  if (config.moduleLabels.length > 0) {
    const allowed = parseCsvList(config.moduleLabels);
    return combined.filter((value) => allowed.has(normalizeName(value)));
  }

  return combined;
}

function matchesFilter(values: string[], selected: string | null): boolean {
  if (!selected) return true;
  const target = normalizeName(selected);
  return values.some((value) => normalizeName(value) === target);
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
  const backend = parseCsvList(config.backendUsers);
  const frontend = parseCsvList(config.frontendUsers);

  let backendCount = 0;
  let frontendCount = 0;
  let otherCount = 0;

  for (const issue of issues) {
    const assignee = normalizeName(getAssigneeName(issue));
    if (!assignee) {
      otherCount += 1;
      continue;
    }
    if (backend.has(assignee)) {
      backendCount += 1;
    } else if (frontend.has(assignee)) {
      frontendCount += 1;
    } else {
      otherCount += 1;
    }
  }

  return {
    backend: backendCount,
    frontend: frontendCount,
    other: otherCount,
    backendLabel: config.backendLabel,
    frontendLabel: config.frontendLabel,
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
      status: getStatusName(issue),
      assignee: getAssigneeName(issue),
      created: formatDateTime(created),
      resolved: formatDateTime(resolved),
      daysToClose: days == null ? null : Number(days.toFixed(1)),
      daysToCloseLabel: days == null ? "" : `${days.toFixed(1)}d`,
      browseUrl: getBrowseUrl(issue.key),
    };
  });
}

function collectFilterOptions(issues: JiraIssue[]): DashboardFilterOptions {
  const people = new Set<string>();
  const modules = new Set<string>();

  for (const issue of issues) {
    for (const value of getPeopleValues(issue)) {
      if (value.trim()) people.add(value.trim());
    }
    for (const value of getModuleValues(issue)) {
      if (value.trim()) modules.add(value.trim());
    }
  }

  const config = getJiraConfig();
  if (!config.moduleField && config.moduleLabels.length > 0) {
    for (const label of config.moduleLabels) {
      modules.add(label);
    }
  }

  return {
    people: Array.from(people).sort((a, b) => a.localeCompare(b)),
    modules: Array.from(modules).sort((a, b) => a.localeCompare(b)),
  };
}

function describeBehavior(filters: DashboardFilters): string {
  if (!filters.people && !filters.module) {
    return "No Filters — showing all project tickets";
  }
  if (filters.people && filters.module) {
    return `People = ${filters.people} + Module = ${filters.module}`;
  }
  if (filters.people) {
    return `People / Ticket Source = ${filters.people}`;
  }
  return `System Area / Module = ${filters.module}`;
}

function buildConfigNotes(): string[] {
  const config = getJiraConfig();
  const notes: string[] = [];

  if (!config.moduleField) {
    notes.push(
      "JIRA_MODULE_FIELD is not set — System Area / Module falls back to Components and Labels. Set a custom field ID in .env, or narrow the list with JIRA_MODULE_LABELS.",
    );
  }

  if (!config.ticketSourceField) {
    notes.push(
      "JIRA_TICKET_SOURCE_FIELD is not set — People / Ticket Source filter falls back to Assignee. Set the custom field ID in .env.",
    );
  }

  return notes;
}

function validateFilterValue(
  value: string | null,
  options: string[],
  label: string,
): string | null {
  if (!value) return null;
  const match = options.find(
    (option) => normalizeName(option) === normalizeName(value),
  );
  if (!match) {
    throw new Error(`Invalid ${label} filter value.`);
  }
  return match;
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
  const allIssues = await loadAllProjectIssues(Boolean(options.forceRefresh));
  const filterOptions = collectFilterOptions(allIssues);

  const people = validateFilterValue(
    filters.people,
    filterOptions.people,
    "people",
  );
  const moduleFilter = validateFilterValue(
    filters.module,
    filterOptions.modules,
    "module",
  );

  const filtered = allIssues.filter((issue) => {
    return (
      matchesFilter(getPeopleValues(issue), people) &&
      matchesFilter(getModuleValues(issue), moduleFilter)
    );
  });

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
      people,
      module: moduleFilter,
      options: filterOptions,
      behavior: describeBehavior({ people, module: moduleFilter }),
    },
    configNotes: buildConfigNotes(),
    total: filtered.length,
    bugs: bugs.length,
    tasks: tasks.length,
    bugStatus: buildStatusCounts(bugs),
    taskStatus: buildStatusCounts(tasks),
    teamSplit: buildTeamSplit(filtered),
    averageCloseTime,
    resolvedBugs,
    resolvedTasks,
    issues: buildIssueRows(filtered),
  };
}
