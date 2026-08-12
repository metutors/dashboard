import { jiraFetch } from "./client";
import {
  DEFAULT_ISSUE_FIELDS,
  getConfiguredCustomFields,
  getJiraConfig,
} from "./config";
import type { JiraIssue, JiraSearchResponse } from "@/types/jira";

const PAGE_SIZE = 100;

type SearchMode = "classic" | "enhanced";

let preferredSearchMode: SearchMode | null = null;

function buildFieldsParam(extraFields: string[] = []): string[] {
  const fields = new Set<string>([
    ...DEFAULT_ISSUE_FIELDS.filter((field) => field !== "key"),
    ...getConfiguredCustomFields(),
    ...extraFields,
  ]);
  return Array.from(fields);
}

async function classicSearch(
  jql: string,
  fields: string[],
  startAt: number,
  maxResults: number,
): Promise<JiraSearchResponse> {
  const params = new URLSearchParams({
    jql,
    startAt: String(startAt),
    maxResults: String(maxResults),
    fields: fields.join(","),
  });

  return jiraFetch<JiraSearchResponse>(
    `/rest/api/3/search?${params.toString()}`,
  );
}

async function enhancedSearch(
  jql: string,
  fields: string[],
  maxResults: number,
  nextPageToken?: string,
): Promise<JiraSearchResponse> {
  return jiraFetch<JiraSearchResponse>("/rest/api/3/search/jql", {
    method: "POST",
    body: JSON.stringify({
      jql,
      maxResults,
      fields,
      ...(nextPageToken ? { nextPageToken } : {}),
    }),
  });
}

export async function getIssues(
  jql: string,
  options: {
    startAt?: number;
    maxResults?: number;
    fields?: string[];
    nextPageToken?: string;
  } = {},
): Promise<JiraSearchResponse> {
  const startAt = options.startAt ?? 0;
  const maxResults = options.maxResults ?? PAGE_SIZE;
  const fields = buildFieldsParam(options.fields);

  if (preferredSearchMode === "enhanced" || options.nextPageToken) {
    return enhancedSearch(jql, fields, maxResults, options.nextPageToken);
  }

  if (preferredSearchMode === "classic") {
    return classicSearch(jql, fields, startAt, maxResults);
  }

  try {
    const page = await classicSearch(jql, fields, startAt, maxResults);
    preferredSearchMode = "classic";
    return page;
  } catch {
    const page = await enhancedSearch(
      jql,
      fields,
      maxResults,
      options.nextPageToken,
    );
    preferredSearchMode = "enhanced";
    return page;
  }
}

export async function getAllIssues(
  jql: string,
  extraFields: string[] = [],
): Promise<JiraIssue[]> {
  const fields = buildFieldsParam(extraFields);
  const allIssues: JiraIssue[] = [];
  let startAt = 0;
  let nextPageToken: string | undefined;
  let safety = 0;
  let mode: SearchMode | null = preferredSearchMode;

  while (safety < 200) {
    safety += 1;

    let page: JiraSearchResponse;

    if (mode === "enhanced" || nextPageToken) {
      page = await enhancedSearch(jql, fields, PAGE_SIZE, nextPageToken);
      mode = "enhanced";
      preferredSearchMode = "enhanced";
    } else if (mode === "classic") {
      page = await classicSearch(jql, fields, startAt, PAGE_SIZE);
    } else {
      try {
        page = await classicSearch(jql, fields, startAt, PAGE_SIZE);
        mode = "classic";
        preferredSearchMode = "classic";
      } catch {
        page = await enhancedSearch(jql, fields, PAGE_SIZE);
        mode = "enhanced";
        preferredSearchMode = "enhanced";
      }
    }

    const issues = page.issues ?? [];
    allIssues.push(...issues);

    if (mode === "enhanced") {
      if (page.isLast || !page.nextPageToken || issues.length === 0) {
        break;
      }
      nextPageToken = page.nextPageToken;
      continue;
    }

    const total = page.total ?? allIssues.length;
    startAt += issues.length;
    if (!issues.length || startAt >= total) {
      break;
    }
  }

  return allIssues;
}

export function buildProjectJql(extraClauses: string[] = []): string {
  const { projectKey, excludeBacklog } = getJiraConfig();
  const clauses = [
    `project = ${projectKey}`,
    // Board "Backlog" = not in an active/future sprint and still unfinished.
    // Those issues often still have a closed sprint on them, so "sprint is not
    // EMPTY" is not enough. Keep active + future sprint work, plus anything
    // already resolved (needed for average close time).
    ...(excludeBacklog
      ? [
          "(sprint in openSprints() OR sprint in futureSprints() OR resolution is not EMPTY)",
        ]
      : []),
    ...extraClauses.filter(Boolean),
  ];
  return `${clauses.join(" AND ")} ORDER BY updated DESC`;
}
