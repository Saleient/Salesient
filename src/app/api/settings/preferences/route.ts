import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { auth } from "@/lib/auth";

const updatePreferencesSchema = z.object({
  customSystemPrompt: z.string().optional(),
});

export async function PUT(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = updatePreferencesSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error },
        { status: 400 }
      );
    }

    const { customSystemPrompt } = result.data;

    // Check if user preferences exist
    const existingPrefs = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, session.user.id),
    });

    let updatedPrefs;
    if (existingPrefs) {
      // Update existing preferences
      [updatedPrefs] = await db
        .update(userPreferences)
        .set({
          systemPreferences: {
            customSystemPrompt: customSystemPrompt || "",
          },
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, session.user.id))
        .returning();
    } else {
      // Create new preferences
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      [updatedPrefs] = await db
        .insert(userPreferences)
        .values({
          userId: session.user.id,
          systemPreferences: {
            customSystemPrompt: customSystemPrompt || "",
          },
          expiresAt,
        })
        .returning();
    }

    if (!updatedPrefs) {
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: updatedPrefs.systemPreferences,
    });
  } catch (error) {
    console.error("Preferences update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentPrefs = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, session.user.id),
    });

    if (!currentPrefs) {
      // Return default preferences if none exist
      return NextResponse.json({
        preferences: {
          customSystemPrompt: "",
        },
      });
    }

    return NextResponse.json({
      preferences: currentPrefs.systemPreferences || {
        customSystemPrompt: "",
      },
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
