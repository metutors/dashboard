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

/**
 * Keyword rule used to place a ticket in a module. Keywords are matched as
 * word-start prefixes against the ticket summary plus its labels and
 * components, so "book" also matches "booking" and "booked".
 *
 * - `any`: at least one keyword must match.
 * - `all`: every group must have at least one matching keyword.
 * - `none`: no keyword may match.
 */
export interface ModuleMatchRule {
  any?: readonly string[];
  all?: readonly (readonly string[])[];
  none?: readonly string[];
}

export interface SubModuleDefinition {
  id: string;
  label: string;
  /** Applied on top of the parent module rule. */
  match: ModuleMatchRule;
}

export interface ModuleDefinition {
  id: string;
  label: string;
  match: ModuleMatchRule;
  subModules: readonly SubModuleDefinition[];
}

const STUDENTS = ["student", "learner"] as const;
const TEACHERS = ["teacher", "tutor"] as const;
const GROUP_COURSES = [
  "group course",
  "groupcourse",
  "group class",
  "group session",
  "group program",
  "live group",
] as const;
const ONE_TO_ONE = [
  "1:1",
  "1-1",
  "1 on 1",
  "one to one",
  "one-to-one",
  "personalized",
  "personalised",
  "private class",
  "individual class",
] as const;

const BOOKING = [
  "book",
  "reschedul",
  "cancel",
  "slot",
  "availab",
  "schedul",
  "session request",
  "class request",
  "subject request",
  "request to teach",
] as const;
const CLASSROOM = [
  "dashboard",
  "classroom",
  "class room",
  "virtual class",
  "zoom",
  "whiteboard",
  "meeting",
  "lesson",
  "join class",
  "attendance",
] as const;
const PAYMENT = [
  "payment",
  "checkout",
  "invoice",
  "stripe",
  "refund",
  "wallet",
  "price",
  "pricing",
  "coupon",
  "gateway",
  "purchase",
  "dispute",
  "finance",
  "payout",
  "billing",
] as const;

/**
 * 1:1 is the default offering: most tickets describe the learning journey
 * without naming it, so a booking, classroom, or payment ticket counts as 1:1
 * unless it explicitly mentions group courses.
 */
const ONE_TO_ONE_OR_LEARNING_FLOW = [
  ...ONE_TO_ONE,
  ...BOOKING,
  ...CLASSROOM,
  ...PAYMENT,
] as const;

function learningSubModules(bookingLabel: string): readonly SubModuleDefinition[] {
  return [
    { id: "booking", label: bookingLabel, match: { any: BOOKING } },
    { id: "classrooms", label: "Dashboard & Classrooms", match: { any: CLASSROOM } },
    { id: "payments", label: "Payment Process & Gateway", match: { any: PAYMENT } },
  ];
}

/**
 * System Area / Module dropdown. A ticket belongs to a module when its text
 * matches the module rule, and to a sub module when it also matches the sub
 * rule. Tune the keyword lists above when new terminology appears in Jira.
 */
export const MODULE_TREE: readonly ModuleDefinition[] = [
  {
    id: "one-to-one-students",
    label: "1:1 Personalized Learning — Students",
    match: {
      all: [STUDENTS, ONE_TO_ONE_OR_LEARNING_FLOW],
      none: GROUP_COURSES,
    },
    subModules: learningSubModules("Booking & Classes Management"),
  },
  {
    id: "group-courses-students",
    label: "Live Group Courses — Students",
    match: { all: [STUDENTS, GROUP_COURSES] },
    subModules: learningSubModules("Booking & Classes Management"),
  },
  {
    id: "one-to-one-teachers",
    label: "1:1 Personalized Learning — Teachers",
    match: {
      all: [TEACHERS, ONE_TO_ONE_OR_LEARNING_FLOW],
      none: GROUP_COURSES,
    },
    subModules: learningSubModules("Booking & Class Management"),
  },
  {
    id: "group-courses-teachers",
    label: "Live Group Courses — Teachers",
    match: { all: [TEACHERS, GROUP_COURSES] },
    subModules: learningSubModules("Booking & Class Management"),
  },
  {
    id: "teachers",
    label: "Teachers",
    match: { any: TEACHERS },
    subModules: [
      {
        id: "profile",
        label: "Teachers Profile & Inner Pages",
        match: {
          any: [
            "profile",
            "inner page",
            "bio",
            "resume",
            "application",
            "interview",
            "document",
            "certificate",
            "onboard",
          ],
        },
      },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    match: { any: ["admin"] },
    subModules: [
      {
        id: "platform-management",
        label: "Admin Platform Management",
        match: { any: ["admin"] },
      },
    ],
  },
  {
    id: "metutorsmate",
    label: "MEtutorsMate",
    match: { any: ["metutorsmate", "metutors mate", "metutors-mate"] },
    subModules: [
      {
        id: "development-model",
        label: "Development Model",
        match: { any: ["development", "model", "roadmap", "release"] },
      },
      {
        id: "subscription-usage",
        label: "Subscription & Usage",
        match: {
          any: ["subscription", "usage", "credit", "quota", "token", "plan"],
        },
      },
    ],
  },
  {
    id: "authentication",
    label: "Authentication",
    match: {
      any: [
        "sign in",
        "signin",
        "sign up",
        "signup",
        "login",
        "log in",
        "register",
        "password",
        "otp",
        "verif",
        "authentic",
        "2fa",
        "forgot",
      ],
    },
    subModules: [
      {
        id: "sign-in-sign-up",
        label: "Sign In / Sign Up",
        match: {
          any: [
            "sign in",
            "signin",
            "sign up",
            "signup",
            "login",
            "log in",
            "register",
          ],
        },
      },
      {
        id: "management",
        label: "Management",
        match: {
          any: [
            "password",
            "otp",
            "verif",
            "forgot",
            "reset",
            "2fa",
            "session expire",
            "account lock",
            "deactivate",
            "delete account",
          ],
        },
      },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    match: {
      any: [
        "email",
        "mail",
        "notification",
        "notif",
        "whatsapp",
        "sms",
        "push",
        "reminder",
        "alert",
      ],
    },
    subModules: [
      { id: "emails", label: "Emails", match: { any: ["email", "mail"] } },
      {
        id: "whatsapp",
        label: "WhatsApp",
        match: { any: ["whatsapp", "whats app"] },
      },
      {
        id: "notifications",
        label: "Notifications",
        match: {
          any: ["notification", "notif", "push", "alert", "reminder"],
        },
      },
    ],
  },
  {
    id: "public-pages",
    label: "Public Pages",
    match: {
      any: [
        "public page",
        "public pages",
        "home page",
        "homepage",
        "landing page",
        "landing",
        "footer",
        "header",
        "navbar",
        "navigation",
        "about us",
        "about page",
        "contact us",
        "contact page",
        "seo",
        "marketing page",
      ],
    },
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
