import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  DEFAULT_PROMPTS,
  getPersonalizedPrompts,
  updatePersonalizedPrompts,
} from "@/lib/personalized-prompts";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          greeting: "Hey there!",
          prompts: DEFAULT_PROMPTS,
        },
        { status: 200 }
      );
    }

    const prompts = await getPersonalizedPrompts(session.user.id);

    // Trigger background regeneration if needed (fire and forget)
    // This will check if prompts are expired and regenerate them
    updatePersonalizedPrompts(session.user.id).catch(() => {
      // Silently fail - we already have prompts to return
    });

    return NextResponse.json({
      greeting: `Hey ${session.user.name || "there"}!`,
      prompts,
    });
  } catch (error) {
    console.error("Error fetching personalized prompts:", error);
    return NextResponse.json(
      {
        greeting: "Hey there!",
        prompts: DEFAULT_PROMPTS,
      },
      { status: 200 }
    );
  }
}

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await updatePersonalizedPrompts(session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to update prompts" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      greeting: `Hey ${session.user.name || "there"}!`,
      prompts: result.prompts,
    });
  } catch (error) {
    console.error("Error updating personalized prompts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
