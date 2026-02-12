import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// GET user profile information
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        emailVerified: session.user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Note: Profile updates (name, email) should be done using Better Auth's client methods:
// - authClient.updateUser({ name: "new name", image: "url" }) for name and image
// - authClient.changeEmail({ newEmail: "new@email.com" }) for email changes
