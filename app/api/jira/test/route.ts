import { NextResponse } from "next/server";
import { getMyself, JiraApiError } from "@/lib/jira/client";
import type { JiraConnectionTestResponse } from "@/types/jira";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<JiraConnectionTestResponse>> {
  try {
    const user = await getMyself();

    return NextResponse.json({
      connected: true,
      user: {
        displayName: user.displayName,
        emailAddress: user.emailAddress,
      },
    });
  } catch (error) {
    const message =
      error instanceof JiraApiError
        ? error.message
        : error instanceof Error && error.message.includes("Missing required")
          ? error.message
          : "Unable to connect to Jira. Please check your configuration.";

    const status = error instanceof JiraApiError ? error.status : 500;

    return NextResponse.json(
      {
        connected: false,
        error: message,
      },
      { status },
    );
  }
}
