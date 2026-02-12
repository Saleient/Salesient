import { lt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { updatePersonalizedPrompts } from "@/lib/personalized-prompts";

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions, or external service)
// to regenerate expired prompts every hour
export async function GET(request: Request) {
  try {
    // Verify the request is from a cron job (optional: add authentication)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all user preferences with expired prompts
    const expiredPrefs = await db
      .select()
      .from(userPreferences)
      .where(lt(userPreferences.expiresAt, new Date()));

    console.log(
      `Found ${expiredPrefs.length} expired prompt sets to regenerate`
    );

    const results = {
      total: expiredPrefs.length,
      successful: 0,
      failed: 0,
    };

    // Regenerate prompts for each user
    for (const pref of expiredPrefs) {
      try {
        await updatePersonalizedPrompts(pref.userId);
        results.successful += 1;
      } catch (error) {
        console.error(
          `Failed to regenerate prompts for user ${pref.userId}:`,
          error
        );
        results.failed += 1;
      }
    }

    console.log(
      `Regeneration complete: ${results.successful} successful, ${results.failed} failed`
    );

    return NextResponse.json({
      message: "Prompt regeneration completed",
      results,
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
