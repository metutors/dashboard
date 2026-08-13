import {
  MODULE_TREE,
  PEOPLE_FILTERS,
  STATUS_MAPPING,
  type ModuleDefinition,
  type PeopleFilterDefinition,
  type SubModuleDefinition,
} from "./constants";
import type {
  DashboardFilterOptions,
  DashboardFilters,
  JiraIssue,
} from "@/types/jira";

export interface ResolvedFilters {
  people: PeopleFilterDefinition | null;
  module: ModuleDefinition | null;
  subModule: SubModuleDefinition | null;
}

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function issueLabels(issue: JiraIssue): Set<string> {
  return new Set(
    (issue.fields.labels ?? [])
      .map((label) => normalize(label))
      .filter(Boolean),
  );
}

function hasLabel(labels: Set<string>, jiraLabel: string): boolean {
  return labels.has(normalize(jiraLabel));
}

function matchesJiraName(
  displayName: string | null | undefined,
  jiraNames: readonly string[],
): boolean {
  const actual = normalize(displayName);
  if (!actual) return false;

  const tokens = new Set(actual.split(/\s+/));
  return jiraNames.some((name) => {
    const expected = normalize(name);
    return actual === expected || tokens.has(expected);
  });
}

function isInProgress(issue: JiraIssue): boolean {
  const status = normalize(issue.fields.status?.name);
  return STATUS_MAPPING.inProgress.some(
    (name) => normalize(name) === status,
  );
}

export function matchesPeopleFilter(
  issue: JiraIssue,
  filter: PeopleFilterDefinition,
): boolean {
  if (filter.mode === "reported") {
    return matchesJiraName(issue.fields.reporter?.displayName, filter.jiraNames);
  }
  return (
    isInProgress(issue) &&
    matchesJiraName(issue.fields.assignee?.displayName, filter.jiraNames)
  );
}

/**
 * Main category → ticket has the main Jira label.
 * Sub category → ticket has BOTH the main label and the sub label.
 */
export function matchesModuleFilter(
  issue: JiraIssue,
  moduleDefinition: ModuleDefinition,
  subModule: SubModuleDefinition | null,
): boolean {
  const labels = issueLabels(issue);
  if (!hasLabel(labels, moduleDefinition.jiraLabel)) return false;
  if (!subModule) return true;
  return hasLabel(labels, subModule.jiraLabel);
}

export function matchesFilters(
  issue: JiraIssue,
  resolved: ResolvedFilters,
): boolean {
  if (resolved.people && !matchesPeopleFilter(issue, resolved.people)) {
    return false;
  }
  if (
    resolved.module &&
    !matchesModuleFilter(issue, resolved.module, resolved.subModule)
  ) {
    return false;
  }
  return true;
}

export function getFilterOptions(): DashboardFilterOptions {
  return {
    people: PEOPLE_FILTERS.map((person) => ({
      id: person.id,
      label: person.label,
      mode: person.mode,
    })),
    modules: MODULE_TREE.map((item) => ({
      id: item.id,
      label: item.label,
      subModules: item.subModules.map((subModule) => ({
        id: subModule.id,
        label: subModule.label,
      })),
    })),
  };
}

export function resolveFilters(filters: DashboardFilters): ResolvedFilters {
  let people: PeopleFilterDefinition | null = null;
  if (filters.people) {
    people = PEOPLE_FILTERS.find((item) => item.id === filters.people) ?? null;
    if (!people) {
      throw new Error("Invalid people filter value.");
    }
  }

  let moduleDefinition: ModuleDefinition | null = null;
  if (filters.module) {
    moduleDefinition =
      MODULE_TREE.find((item) => item.id === filters.module) ?? null;
    if (!moduleDefinition) {
      throw new Error("Invalid module filter value.");
    }
  }

  let subModule: SubModuleDefinition | null = null;
  if (filters.subModule) {
    if (!moduleDefinition) {
      throw new Error("Invalid module filter value.");
    }
    subModule =
      moduleDefinition.subModules.find(
        (item) => item.id === filters.subModule,
      ) ?? null;
    if (!subModule) {
      throw new Error("Invalid module filter value.");
    }
  }

  return { people, module: moduleDefinition, subModule };
}

export function describeFilters(resolved: ResolvedFilters): string {
  const parts: string[] = [];

  if (resolved.people) {
    const scope =
      resolved.people.mode === "working"
        ? "In Progress tickets assigned"
        : "all tickets reported";
    parts.push(`${resolved.people.label} (${scope})`);
  }

  if (resolved.module) {
    parts.push(
      resolved.subModule
        ? `${resolved.module.label} › ${resolved.subModule.label}`
        : resolved.module.label,
    );
  }

  if (parts.length === 0) {
    return "No filters — showing all project tickets";
  }

  return parts.join(" + ");
}
