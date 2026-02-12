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
    const baseURL =
      process.env.NODE_ENV === "production"
        ? "https://www.salesorbit.xyz"
        : "http://localhost:3000";

    const verifyUrl = `${baseURL}/api/auth/magic-link/verify?token=${code}&callbackURL=/dashboard`;

    return NextResponse.json({
      success: true,
      redirectUrl: verifyUrl,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
