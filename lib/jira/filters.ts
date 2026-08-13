import {
  MODULE_TREE,
  PEOPLE_FILTERS,
  STATUS_MAPPING,
  type ModuleDefinition,
  type ModuleMatchRule,
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

/**
 * Splits camel case and separator-joined words so Jira labels such as
 * "EmailAndNotifications" or "Teacher-Portal" match plain keywords.
 */
function splitWords(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_\-/.]+/g, " ")
    .toLowerCase();
}

const haystackCache = new WeakMap<JiraIssue, string>();

function getHaystack(issue: JiraIssue): string {
  const cached = haystackCache.get(issue);
  if (cached !== undefined) return cached;

  const parts = [
    issue.fields.summary ?? "",
    ...(issue.fields.labels ?? []),
    ...(issue.fields.components ?? []).map((component) => component.name),
  ];
  const haystack = ` ${parts.map(splitWords).join(" ")} `;
  haystackCache.set(issue, haystack);
  return haystack;
}

const keywordPatterns = new Map<string, RegExp>();

/** Keywords match at a word start, so "book" also matches "booking". */
function keywordPattern(keyword: string): RegExp {
  const cached = keywordPatterns.get(keyword);
  if (cached) return cached;

  const escaped = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(?:^|[^a-z0-9])${escaped}`);
  keywordPatterns.set(keyword, pattern);
  return pattern;
}

function hasKeyword(haystack: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => keywordPattern(keyword).test(haystack));
}

function matchesRule(haystack: string, rule: ModuleMatchRule): boolean {
  if (rule.none && hasKeyword(haystack, rule.none)) return false;
  if (rule.all && !rule.all.every((group) => hasKeyword(haystack, group))) {
    return false;
  }
  if (rule.any && !hasKeyword(haystack, rule.any)) return false;
  return true;
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

export function matchesModuleFilter(
  issue: JiraIssue,
  moduleDefinition: ModuleDefinition,
  subModule: SubModuleDefinition | null,
): boolean {
  const haystack = getHaystack(issue);
  if (!matchesRule(haystack, moduleDefinition.match)) return false;
  if (!subModule) return true;
  return matchesRule(haystack, subModule.match);
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
