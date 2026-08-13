import { NextRequest, NextResponse } from "next/server";
import { JiraApiError } from "@/lib/jira/client";
import { getDashboardData } from "@/lib/jira/dashboard";
import type { DashboardData } from "@/types/jira";

export const dynamic = "force-dynamic";

/** Filter values are ids defined in lib/jira/constants.ts, never free text. */
function sanitizeFilter(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 60 || !/^[a-z0-9-]+$/.test(trimmed)) {
    throw new Error("Invalid filter value.");
  }
  return trimmed;
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<DashboardData | { success: false; error: string }>> {
  try {
    const { searchParams } = request.nextUrl;
    const people = sanitizeFilter(searchParams.get("people"));
    const moduleFilter = sanitizeFilter(searchParams.get("module"));
    const subModule = sanitizeFilter(searchParams.get("submodule"));
    const refresh =
      searchParams.get("refresh") === "1" ||
      searchParams.get("refresh") === "true";

    const data = await getDashboardData(
      { people, module: moduleFilter, subModule },
      { forceRefresh: refresh },
    );

    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof JiraApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Unable to load Jira data.";

    const status =
      error instanceof JiraApiError
        ? error.status
        : message.startsWith("Invalid")
          ? 400
          : 500;

    return NextResponse.json(
      {
        success: false,
        error:
          status >= 500 && !(error instanceof JiraApiError)
            ? "Unable to load Jira data. Please check your Jira configuration or try Pull Live again."
            : message,
      },
      { status },
    );
  }
}
