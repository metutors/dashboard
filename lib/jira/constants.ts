/**
 * Project-level Jira mappings and defaults.
 * Edit this file when statuses, teams, or module labels change —
 * they are intentionally not environment variables.
 */

export const ISSUE_TYPES = {
  bug: ["Bug"] as const,
  task: ["Task"] as const,
} as const;

/** Jira status names that map into each dashboard status bucket. */
export const STATUS_MAPPING = {
  done: ["Done", "Closed", "Resolved"],
  inProgress: ["In Progress"],
  onHold: ["On Hold"],
  readyForQA: ["Ready for QA"],
  todo: ["To Do", "Open", "Backlog", "Re-opened", "Changed by Client"],
} as const;

export const TEAMS = {
  backend: {
    label: "BACKEND — AHTSHAM UL HASSAN",
    users: ["Ahtsham Ul Hassan"],
  },
  frontend: {
    label: "FRONTEND — AHMED HASSAN",
    users: ["Ahmed Hassan"],
  },
} as const;

/** Labels used for System Area / Module when no custom field is configured. */
export const MODULE_LABELS = [
  "EmailAndNotifications",
  "GroupCourses",
  "Teacher-Portal",
  "Student-Portal",
  "Admin-Portal",
  "Home-Page",
  "filters",
  "UIIssues",
] as const;

export const PROJECT_DEFAULTS = {
  projectName: "ME TUTORS MVP-II - ME TUTORS",
  cacheMinutes: 5,
  excludeBacklog: true,
} as const;

export const DEFAULT_ISSUE_FIELDS = [
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
