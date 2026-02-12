import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists in database
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    return NextResponse.json({
      exists: existingUser.length > 0,
    });
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json(
      { error: "Failed to check user" },
      { status: 500 }
    );
  }
}
