import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";

const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE"),
  password: z.string().optional(), // Optional password for verification
});

export async function DELETE(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = deleteAccountSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid confirmation",
          message: "Please type 'DELETE' to confirm account deletion",
        },
        { status: 400 }
      );
    }

    const { password } = result.data;

    try {
      // Use Better Auth's deleteUser API
      const _deleteResult = await auth.api.deleteUser({
        headers: await headers(),
        body: password ? { password } : {}, // Include password if provided
      });

      return NextResponse.json({
        success: true,
        message: "Account successfully deleted",
      });
    } catch (authError: any) {
      console.error("Better Auth delete error:", authError);
      return NextResponse.json(
        {
          error: "Failed to delete account",
          message: authError.message || "Authentication error occurred",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
