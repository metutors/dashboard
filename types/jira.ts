export interface JiraUser {
  accountId?: string;
  displayName: string;
  emailAddress?: string;
  active?: boolean;
  avatarUrls?: Record<string, string>;
}

export interface JiraStatus {
  id?: string;
  name: string;
  statusCategory?: {
    id?: number;
    key?: string;
    name?: string;
  };
}

export interface JiraIssueType {
  id?: string;
  name: string;
  iconUrl?: string;
  subtask?: boolean;
}

export interface JiraPriority {
  id?: string;
  name: string;
  iconUrl?: string;
}

export interface JiraComponent {
  id?: string;
  name: string;
}

export interface JiraIssueFields {
  summary: string;
  issuetype?: JiraIssueType;
  status?: JiraStatus;
  assignee?: JiraUser | null;
  reporter?: JiraUser | null;
  created?: string;
  updated?: string;
  resolutiondate?: string | null;
  priority?: JiraPriority | null;
  components?: JiraComponent[];
  labels?: string[];
  [customField: string]: unknown;
}

export interface JiraIssue {
  id: string;
  key: string;
  self?: string;
  fields: JiraIssueFields;
}

export interface JiraSearchResponse {
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
  nextPageToken?: string;
  isLast?: boolean;
}

export interface StatusCounts {
  done: number;
  inProgress: number;
  onHold: number;
  readyForQA: number;
  reopened: number;
  todo: number;
}

export interface TeamMemberStats {
  total: number;
  bugs: number;
  tasks: number;
  open: number;
  done: number;
  readyForQA: number;
}

export interface TeamSplit {
  backend: TeamMemberStats;
  frontend: TeamMemberStats;
  qa: TeamMemberStats;
  unassigned: TeamMemberStats;
  backendLabel: string;
  frontendLabel: string;
  qaLabel: string;
}

export interface HealthMetrics {
  unassigned: number;
  stale30Days: number;
  reopened: number;
  onHold: number;
}

export interface AverageCloseTime {
  bugs: number | null;
  bugsCount: number;
  tasks: number | null;
  tasksCount: number;
}

export interface ResolvedIssue {
  key: string;
  summary: string;
  created: string | null;
  resolved: string | null;
  daysToClose: number;
  daysToCloseLabel: string;
  browseUrl: string;
}

export interface DashboardIssueRow {
  key: string;
  summary: string;
  type: string;
  status: string;
  statusBucket: keyof StatusCounts | null;
  assignee: string | null;
  created: string | null;
  resolved: string | null;
  daysToClose: number | null;
  daysToCloseLabel: string;
  browseUrl: string;
}

/** Filter selections are stable ids from lib/jira/constants.ts, not free text. */
export interface DashboardFilters {
  people: string | null;
  module: string | null;
  subModule: string | null;
}

export interface PeopleFilterOption {
  id: string;
  label: string;
  mode: "reported" | "working";
}

export interface SubModuleFilterOption {
  id: string;
  label: string;
}

export interface ModuleFilterOption {
  id: string;
  label: string;
  subModules: SubModuleFilterOption[];
}

export interface DashboardFilterOptions {
  people: PeopleFilterOption[];
  modules: ModuleFilterOption[];
}

export interface AppliedDashboardFilters {
  people: string | null;
  peopleLabel: string | null;
  module: string | null;
  moduleLabel: string | null;
  subModule: string | null;
  subModuleLabel: string | null;
  active: boolean;
  options: DashboardFilterOptions;
  behavior: string;
}

export interface DashboardData {
  success: boolean;
  projectName: string;
  projectKey: string;
  lastUpdated: string;
  lastUpdatedFormatted: string;
  filters: AppliedDashboardFilters;
  total: number;
  bugs: number;
  tasks: number;
  bugStatus: StatusCounts;
  taskStatus: StatusCounts;
  teamSplit: TeamSplit;
  health: HealthMetrics;
  averageCloseTime: AverageCloseTime;
  resolvedBugs: ResolvedIssue[];
  resolvedTasks: ResolvedIssue[];
  issues: DashboardIssueRow[];
}

export interface JiraConnectionTestResponse {
  connected: boolean;
  user?: {
    displayName: string;
    emailAddress?: string;
  };
  error?: string;
}
