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
  reopened: ["Re-opened"],
  todo: ["To Do", "Open", "Backlog", "Changed by Client"],
} as const;

/** Statuses included by People / Ticket Source "Working" filters. */
export const WORKING_STATUSES = [
  ...STATUS_MAPPING.inProgress,
  ...STATUS_MAPPING.onHold,
  ...STATUS_MAPPING.readyForQA,
  ...STATUS_MAPPING.reopened,
  ...STATUS_MAPPING.todo,
  "Consider",
] as const;

/** User-facing labels for dashboard status buckets. */
export const STATUS_BUCKET_LABELS = {
  done: "Done",
  inProgress: "In Progress",
  onHold: "On Hold",
  readyForQA: "Ready for QA",
  reopened: "Reopened",
  todo: "Pending/To Do",
} as const;

/** Options for the matching-tickets status filter. */
export const STATUS_FILTER_OPTIONS = [
  { value: "done", label: STATUS_BUCKET_LABELS.done },
  { value: "inProgress", label: STATUS_BUCKET_LABELS.inProgress },
  { value: "onHold", label: STATUS_BUCKET_LABELS.onHold },
  { value: "readyForQA", label: STATUS_BUCKET_LABELS.readyForQA },
  { value: "reopened", label: STATUS_BUCKET_LABELS.reopened },
  { value: "todo", label: STATUS_BUCKET_LABELS.todo },
] as const satisfies ReadonlyArray<{
  value: keyof typeof STATUS_BUCKET_LABELS;
  label: string;
}>;

/** Ticket list status text when Jira reports "To Do". */
export const TODO_STATUS_DISPLAY = "Pending";

/** Maps Jira status names to dashboard display labels. */
export function displayStatusName(jiraStatus: string): string {
  const normalized = jiraStatus.trim().toLowerCase();
  if (normalized === "to do") {
    return TODO_STATUS_DISPLAY;
  }
  if (normalized === "re-opened") {
    return STATUS_BUCKET_LABELS.reopened;
  }
  return jiraStatus.trim();
}

export const TEAMS = {
  backend: {
    label: "BACKEND — AHTSHAM UL HASSAN",
    users: ["Ahtsham Ul Hassan", "Ahtsham ul Hassan"],
  },
  frontend: {
    label: "FRONTEND — AHMED HASSAN",
    users: ["Ahmed Hassan"],
  },
  qa: {
    label: "QA — USMAN MALIK",
    // Jira still stores Usman as Mubashar / Mubashir Hussain.
    users: ["Mubashar Hussain", "Mubashir Hussain"],
  },
} as const;

/**
 * Display-only aliases. Matching still uses the Jira display name;
 * the UI and exports show the alias instead.
 */
export const DISPLAY_NAME_ALIASES: Record<string, string> = {
  "mubashar hussain": "Usman Malik",
  "mubashir hussain": "Usman Malik",
};

export type PeopleFilterMode = "reported" | "working";

export interface PeopleFilterDefinition {
  id: string;
  label: string;
  /** "reported" matches a Jira label; "working" matches active assignees. */
  mode: PeopleFilterMode;
  /** Jira assignee display names — working filters only. */
  jiraNames?: readonly string[];
  /** Exact Jira label — reported filters only. */
  jiraLabel?: string;
}

/** People / Ticket Source dropdown, in display order. */
export const PEOPLE_FILTERS: readonly PeopleFilterDefinition[] = [
  {
    id: "reported-usman",
    label: "Reported by Usman",
    mode: "reported",
    jiraLabel: "ReportedbyUsman",
  },
  {
    id: "working-viber",
    label: "Viber Working",
    mode: "working",
    jiraNames: ["Ahmed Hassan"],
  },
  {
    id: "working-usman",
    label: "Usman Working",
    mode: "working",
    jiraNames: ["Mubashar Hussain", "Mubashir Hussain"],
  },
  {
    id: "working-ahtsham",
    label: "Ahtsham Working",
    mode: "working",
    jiraNames: ["Ahtsham ul Hassan"],
  },
  {
    id: "reported-farah",
    label: "Reported by Farah",
    mode: "reported",
    jiraLabel: "ReportedbyFarah",
  },
  {
    id: "reported-fayez",
    label: "Reported by Fayez",
    mode: "reported",
    jiraLabel: "ReportedbyFayez",
  },
  {
    id: "reported-razan",
    label: "Reported by Razan",
    mode: "reported",
    jiraLabel: "ReportedbyRazan",
  },
] as const;

export interface SubModuleDefinition {
  id: string;
  label: string;
  /** Exact Jira label for this sub category. */
  jiraLabel: string;
}

export interface ModuleDefinition {
  id: string;
  label: string;
  /** Exact Jira label for this main category. */
  jiraLabel: string;
  subModules: readonly SubModuleDefinition[];
}

function learningSubModules(
  bookingLabel: string,
  bookingJiraLabel: string,
): readonly SubModuleDefinition[] {
  return [
    {
      id: "booking",
      label: bookingLabel,
      jiraLabel: bookingJiraLabel,
    },
    {
      id: "classrooms",
      label: "Dashboard & Classrooms",
      jiraLabel: "Dashboard-Classrooms",
    },
    {
      id: "payments",
      label: "Payment Process & Gateway",
      jiraLabel: "Payment-Process-Gateway",
    },
  ];
}

/**
 * System Area / Module dropdown.
 *
 * Main category → ticket must have the main Jira label.
 * Sub category → ticket must have BOTH the main label and the sub label.
 *
 * Label names must match Jira exactly (case-insensitive).
 */
export const MODULE_TREE: readonly ModuleDefinition[] = [
  {
    id: "one-to-one-students",
    label: "1:1 Personalized Learning — Students",
    jiraLabel: "1-1-Personalized-Learning-Students",
    subModules: learningSubModules(
      "Booking & Classes Management",
      "Booking-Classes-Management",
    ),
  },
  {
    id: "group-courses-students",
    label: "Live Group Courses — Students",
    jiraLabel: "Live-Group-Courses-Students",
    subModules: learningSubModules(
      "Booking & Classes Management",
      "Booking-Classes-Management",
    ),
  },
  {
    id: "one-to-one-teachers",
    label: "1:1 Personalized Learning — Teachers",
    jiraLabel: "1-1-Personalized-Learning-Teachers",
    subModules: learningSubModules(
      "Booking & Class Management",
      "Booking-Class-Management",
    ),
  },
  {
    id: "group-courses-teachers",
    label: "Live Group Courses — Teachers",
    jiraLabel: "Live-Group-Courses-Teachers",
    subModules: learningSubModules(
      "Booking & Class Management",
      "Booking-Class-Management",
    ),
  },
  {
    id: "teachers",
    label: "Teachers",
    jiraLabel: "Teachers",
    subModules: [
      {
        id: "profile",
        label: "Teachers Profile & Inner Pages",
        jiraLabel: "Teachers-Profile-Inner-Pages",
      },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    jiraLabel: "Admin",
    subModules: [
      {
        id: "platform-management",
        label: "Admin Platform Management",
        jiraLabel: "Admin-Platform-Management",
      },
    ],
  },
  {
    id: "metutorsmate",
    label: "MEtutorsMate",
    jiraLabel: "MEtutorsMate",
    subModules: [
      {
        id: "development-model",
        label: "Development Model",
        jiraLabel: "Development-Model",
      },
      {
        id: "subscription-usage",
        label: "Subscription & Usage",
        jiraLabel: "Subscription-Usage",
      },
    ],
  },
  {
    id: "authentication",
    label: "Authentication",
    jiraLabel: "Authentication",
    subModules: [
      {
        id: "sign-in-sign-up",
        label: "Sign In / Sign Up",
        jiraLabel: "Sign-In-Sign-Up",
      },
      {
        id: "management",
        label: "Management",
        jiraLabel: "Management",
      },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    jiraLabel: "Communication",
    subModules: [
      { id: "emails", label: "Emails", jiraLabel: "Emails" },
      { id: "whatsapp", label: "WhatsApp", jiraLabel: "WhatsApp" },
      {
        id: "notifications",
        label: "Notifications",
        jiraLabel: "Notifications",
      },
    ],
  },
  {
    id: "public-pages",
    label: "Public Pages",
    jiraLabel: "Public-Pages",
    subModules: [],
  },
] as const;

export const PROJECT_DEFAULTS = {
  projectName: "METUTORS MVP-II - METUTORS",
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
