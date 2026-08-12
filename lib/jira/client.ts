import { getJiraConfig } from "./config";

export class JiraApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = "JIRA_ERROR") {
    super(message);
    this.name = "JiraApiError";
    this.status = status;
    this.code = code;
  }
}

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;

function getAuthHeader(): string {
  const { email, apiToken } = getJiraConfig();
  const token = Buffer.from(`${email}:${apiToken}`).toString("base64");
  return `Basic ${token}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const asNumber = Number(header);
  if (!Number.isNaN(asNumber)) return asNumber * 1000;
  const asDate = Date.parse(header);
  if (!Number.isNaN(asDate)) return Math.max(0, asDate - Date.now());
  return null;
}

function friendlyError(status: number, bodyText: string): JiraApiError {
  if (status === 401 || status === 403) {
    return new JiraApiError(
      "Jira authentication failed. Check JIRA_EMAIL and JIRA_API_TOKEN.",
      status,
      "AUTH_FAILED",
    );
  }
  if (status === 429) {
    return new JiraApiError(
      "Jira rate limit exceeded. Please try again shortly.",
      status,
      "RATE_LIMITED",
    );
  }
  if (status === 400) {
    return new JiraApiError(
      "Invalid Jira request. Check project key or filter values.",
      status,
      "BAD_REQUEST",
    );
  }
  if (status >= 500) {
    return new JiraApiError(
      "Jira API is temporarily unavailable.",
      status,
      "JIRA_UNAVAILABLE",
    );
  }

  const truncated = bodyText.slice(0, 200);
  return new JiraApiError(
    truncated || `Jira request failed with status ${status}.`,
    status,
    "JIRA_ERROR",
  );
}

export async function jiraFetch<T>(
  path: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const { url } = getJiraConfig();
  const endpoint = path.startsWith("http")
    ? path
    : `${url}${path.startsWith("/") ? path : `/${path}`}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        ...init,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
          ...(init.headers ?? {}),
        },
        cache: "no-store",
      });

      if (response.status === 429 && attempt < MAX_RETRIES) {
        const retryAfter =
          parseRetryAfter(response.headers.get("Retry-After")) ??
          1000 * (attempt + 1);
        await sleep(retryAfter);
        continue;
      }

      if (!response.ok) {
        const bodyText = await response.text();
        const apiError = friendlyError(response.status, bodyText);
        // Do not retry client/auth/gone responses — fail fast.
        if (
          response.status === 400 ||
          response.status === 401 ||
          response.status === 403 ||
          response.status === 404 ||
          response.status === 410
        ) {
          throw apiError;
        }
        throw apiError;
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof JiraApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        lastError = new JiraApiError(
          "Jira request timed out.",
          504,
          "TIMEOUT",
        );
      } else {
        lastError =
          error instanceof Error
            ? error
            : new Error("Unknown Jira request error");
      }

      if (attempt < MAX_RETRIES) {
        await sleep(500 * (attempt + 1));
        continue;
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw (
    lastError ??
    new JiraApiError("Unable to reach Jira API.", 502, "NETWORK_ERROR")
  );
}

export async function getMyself(): Promise<{
  displayName: string;
  emailAddress?: string;
  accountId?: string;
}> {
  return jiraFetch("/rest/api/3/myself");
}
