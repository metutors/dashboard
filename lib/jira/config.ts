import {
  DEFAULT_ISSUE_FIELDS,
  ISSUE_TYPES,
  PROJECT_DEFAULTS,
  STATUS_MAPPING,
  TEAMS,
} from "./constants";

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

export interface JiraConfig {
  url: string;
  email: string;
  apiToken: string;
  projectKey: string;
  projectName: string;
  cacheMinutes: number;
  excludeBacklog: boolean;
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
  qaUsers: string[];
  backendLabel: string;
  frontendLabel: string;
  qaLabel: string;
}

let cachedConfig: JiraConfig | null = null;

export function getJiraConfig(): JiraConfig {
  if (cachedConfig) return cachedConfig;

  const url = required("JIRA_URL").replace(/\/$/, "");
  const projectKey = required("JIRA_PROJECT_KEY");

  cachedConfig = {
    url,
    email: required("JIRA_EMAIL"),
    apiToken: required("JIRA_API_TOKEN"),
    projectKey,
    projectName: optional("JIRA_PROJECT_NAME", PROJECT_DEFAULTS.projectName || projectKey),
    cacheMinutes: PROJECT_DEFAULTS.cacheMinutes,
    excludeBacklog: PROJECT_DEFAULTS.excludeBacklog,
    bugTypes: [...ISSUE_TYPES.bug],
    taskTypes: [...ISSUE_TYPES.task],
    statusMapping: {
      done: [...STATUS_MAPPING.done],
      inProgress: [...STATUS_MAPPING.inProgress],
      onHold: [...STATUS_MAPPING.onHold],
      readyForQA: [...STATUS_MAPPING.readyForQA],
      todo: [...STATUS_MAPPING.todo],
    },
    backendUsers: [...TEAMS.backend.users],
    frontendUsers: [...TEAMS.frontend.users],
    qaUsers: [...TEAMS.qa.users],
    backendLabel: TEAMS.backend.label,
    frontendLabel: TEAMS.frontend.label,
    qaLabel: TEAMS.qa.label,
  };

  return cachedConfig;
}

export function getBrowseUrl(issueKey: string): string {
  const { url } = getJiraConfig();
  return `${url}/browse/${issueKey}`;
}

export { DEFAULT_ISSUE_FIELDS };
