function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.replace(/^["']|["']$/g, "");
}

function optional(name: string, fallback = ""): string {
  const value = process.env[name]?.trim();
  if (!value) return fallback;
  return value.replace(/^["']|["']$/g, "");
}

function csv(name: string, fallback: string[] = []): string[] {
  const raw = optional(name);
  if (!raw) return fallback;
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export interface JiraConfig {
  url: string;
  email: string;
  apiToken: string;
  projectKey: string;
  projectName: string;
  cacheMinutes: number;
  excludeBacklog: boolean;
  moduleField: string | null;
  ticketSourceField: string | null;
  moduleLabels: string[];
  bugTypes: string[];
  taskTypes: string[];
  statusMapping: {
    done: string[];
    inProgress: string[];
    onHold: string[];
    readyForQA: string[];
    todo: string[];
  };
  backendUsers: string[];
  frontendUsers: string[];
  backendLabel: string;
  frontendLabel: string;
}

let cachedConfig: JiraConfig | null = null;

export function getJiraConfig(): JiraConfig {
  if (cachedConfig) return cachedConfig;

  const url = required("JIRA_URL").replace(/\/$/, "");

  cachedConfig = {
    url,
    email: required("JIRA_EMAIL"),
    apiToken: required("JIRA_API_TOKEN"),
    projectKey: required("JIRA_PROJECT_KEY"),
    projectName: optional("JIRA_PROJECT_NAME", required("JIRA_PROJECT_KEY")),
    cacheMinutes: Math.max(1, Number(optional("JIRA_CACHE_MINUTES", "5")) || 5),
    // Default true: ignore board Backlog issues (no sprint assigned).
    excludeBacklog: optional("JIRA_EXCLUDE_BACKLOG", "true").toLowerCase() !== "false",
    moduleField: optional("JIRA_MODULE_FIELD") || null,
    ticketSourceField: optional("JIRA_TICKET_SOURCE_FIELD") || null,
    moduleLabels: csv("JIRA_MODULE_LABELS"),
    bugTypes: csv("JIRA_BUG_TYPES", ["Bug"]),
    taskTypes: csv("JIRA_TASK_TYPES", ["Task"]),
    statusMapping: {
      done: csv("JIRA_STATUS_DONE", ["Done"]),
      inProgress: csv("JIRA_STATUS_IN_PROGRESS", ["In Progress"]),
      onHold: csv("JIRA_STATUS_ON_HOLD", ["On Hold"]),
      readyForQA: csv("JIRA_STATUS_READY_FOR_QA", ["Ready for QA"]),
      todo: csv("JIRA_STATUS_TODO", ["To Do"]),
    },
    backendUsers: csv("JIRA_BACKEND_USERS"),
    frontendUsers: csv("JIRA_FRONTEND_USERS"),
    backendLabel: optional("JIRA_BACKEND_LABEL", "BACKEND"),
    frontendLabel: optional("JIRA_FRONTEND_LABEL", "FRONTEND"),
  };

  return cachedConfig;
}

export function getBrowseUrl(issueKey: string): string {
  const { url } = getJiraConfig();
  return `${url}/browse/${issueKey}`;
}

export const DEFAULT_ISSUE_FIELDS = [
  "key",
  "summary",
  "issuetype",
  "status",
  "assignee",
  "reporter",
  "created",
  "updated",
  "resolutiondate",
  "priority",
  "components",
  "labels",
] as const;

export function getConfiguredCustomFields(): string[] {
  const config = getJiraConfig();
  return [config.moduleField, config.ticketSourceField].filter(
    (field): field is string => Boolean(field),
  );
}
