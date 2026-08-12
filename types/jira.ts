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
  todo: number;
}

export interface TeamSplit {
  backend: number;
  frontend: number;
  other: number;
  backendLabel: string;
  frontendLabel: string;
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
  assignee: string | null;
  created: string | null;
  resolved: string | null;
  daysToClose: number | null;
  daysToCloseLabel: string;
  browseUrl: string;
}

export interface DashboardFilters {
  people: string | null;
  module: string | null;
}

export interface DashboardFilterOptions {
  people: string[];
  modules: string[];
}

export interface DashboardData {
  success: boolean;
  projectName: string;
  projectKey: string;
  lastUpdated: string;
  lastUpdatedFormatted: string;
  filters: {
    people: string | null;
    module: string | null;
    options: DashboardFilterOptions;
    behavior: string;
  };
  configNotes: string[];
  total: number;
  bugs: number;
  tasks: number;
  bugStatus: StatusCounts;
  taskStatus: StatusCounts;
  teamSplit: TeamSplit;
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
