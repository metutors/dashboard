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
  /** "reported" matches the Jira reporter, "working" matches In Progress assignees. */
  mode: PeopleFilterMode;
  /** Jira display names this person maps to. Usman is Mubashar, Viber is Ahmed. */
  jiraNames: readonly string[];
}

/** People / Ticket Source dropdown, in display order. */
export const PEOPLE_FILTERS: readonly PeopleFilterDefinition[] = [
  {
    id: "reported-usman",
    label: "Reported by Usman",
    mode: "reported",
    jiraNames: ["Mubashar Hussain", "Mubashir Hussain"],
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
    jiraNames: ["Farah"],
  },
  {
    id: "reported-fayez",
    label: "Reported by Fayez",
    mode: "reported",
    jiraNames: ["Fayez Kharbat"],
  },
  {
    id: "reported-razan",
    label: "Reported by Razan",
    mode: "reported",
    jiraNames: ["Razan"],
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
