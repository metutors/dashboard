import { NextRequest, NextResponse } from "next/server";
import { JiraApiError } from "@/lib/jira/client";
import { getDashboardData } from "@/lib/jira/dashboard";
import { buildDashboardWorkbook } from "@/lib/jira/excel";

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

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl;
    const people = sanitizeFilter(searchParams.get("people"));
    const moduleFilter = sanitizeFilter(searchParams.get("module"));
    const subModule = sanitizeFilter(searchParams.get("submodule"));

    const data = await getDashboardData({
      people,
      module: moduleFilter,
      subModule,
    });
    const buffer = await buildDashboardWorkbook(data);
    const body = new Uint8Array(buffer);

    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `me-tutors-dashboard-${data.projectKey}-${stamp}.xlsx`;

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof JiraApiError
        ? error.message
        : "Unable to export dashboard data.";

    return NextResponse.json(
      { success: false, error: message },
      { status: error instanceof JiraApiError ? error.status : 500 },
    );
  }
}
