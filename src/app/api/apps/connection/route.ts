import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/env";
import { auth } from "@/lib/auth";

// GET: Check connection status for all toolkits for authenticated user
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      return new Response("User email not found", { status: 400 });
    }

    // Use direct REST API call to Composio backend
    const apiKey = serverEnv.COMPOSIO_API_KEY;
    if (!apiKey) {
      throw new Error("COMPOSIO_API_KEY is not set");
    }

    const url = `https://backend.composio.dev/api/v3/connected_accounts?user_ids=${encodeURIComponent(
      userEmail
    )}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Composio API returned ${response.status}: ${errorText}`);
    }

    const connectedAccountsData = await response.json();

    // Handle different response formats
    const items =
      connectedAccountsData.items ||
      connectedAccountsData.connectedAccounts ||
      [];

    return NextResponse.json({ connectedAccounts: items });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch connection status", details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Disconnect a toolkit
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use direct REST API call to Composio backend
    const apiKey = serverEnv.COMPOSIO_API_KEY;
    if (!apiKey) {
      throw new Error("COMPOSIO_API_KEY is not set");
    }

    const response = await fetch(
      `https://backend.composio.dev/api/v3/connected_accounts/${accountId}`,
      {
        method: "DELETE",
        headers: {
          "x-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Composio API returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to disconnect account", details: String(error) },
      { status: 500 }
    );
  }
}
