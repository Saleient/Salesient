import { type NextRequest, NextResponse } from "next/server";
import { getComposio } from "@/lib/compostio";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolkit: toolkitSlug } = body;

    if (!toolkitSlug) {
      return NextResponse.json(
        { error: "Toolkit slug is required" },
        { status: 400 }
      );
    }

    const composio = getComposio();
    const toolkit = await composio.toolkits.get(toolkitSlug);

    return NextResponse.json(toolkit);
  } catch (error) {
    console.error("Error fetching toolkit details:", error);
    return NextResponse.json(
      { error: "Failed to fetch toolkit details" },
      { status: 500 }
    );
  }
}
