import { NextResponse } from "next/server";
import { serverEnv } from "@/env";

export async function GET() {
  try {
    console.log("[API] Fetching integrations/auth configs");

    const apiKey = serverEnv.COMPOSIO_API_KEY;
    if (!apiKey) {
      throw new Error("COMPOSIO_API_KEY is not set");
    }

    console.log(
      "[API] Calling Composio REST API: https://backend.composio.dev/api/v3/auth_configs"
    );

    const response = await fetch(
      "https://backend.composio.dev/api/v3/auth_configs",
      {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[API] Composio auth configs API error:",
        response.status,
        errorText
      );
      throw new Error(`Composio API returned ${response.status}: ${errorText}`);
    }

    const authConfigsData = await response.json();

    console.log(
      "[API] Auth configs response:",
      JSON.stringify(authConfigsData, null, 2)
    );
    console.log(
      "[API] Total auth configs:",
      authConfigsData.items?.length || 0
    );

    return NextResponse.json({ items: authConfigsData.items || [] });
  } catch (error) {
    console.error("[API] Error fetching integrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations", details: String(error) },
      { status: 500 }
    );
  }
}
