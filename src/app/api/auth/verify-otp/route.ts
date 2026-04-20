import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!(email && code)) {
      return NextResponse.json(
        { success: false, error: "Email and code are required" },
        { status: 400 }
      );
    }

    // Create a verification URL to trigger the Better Auth magic link verification
    const configuredBaseURL =
      process.env.BETTER_AUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      new URL(request.url).origin;
    const baseURL = configuredBaseURL.replace(/\/$/, "");
    const verifyUrl = new URL("/api/auth/magic-link/verify", baseURL);
    verifyUrl.searchParams.set("token", code);
    verifyUrl.searchParams.set("callbackURL", "/dashboard");

    return NextResponse.json({
      success: true,
      redirectUrl: verifyUrl.toString(),
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
