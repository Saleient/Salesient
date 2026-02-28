import { Resend } from "resend";
import { serverEnv } from "@/env";
import { EmailTemplate } from "../../../components/email-template";

const resend = new Resend(serverEnv.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp, magicLink } = body;

    if (!(email && otp)) {
      return Response.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const fromAddress =
      process.env.NODE_ENV === "production"
        ? "Salesient <noreply@salesorbit.xyz>"
        : "Salesient <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: "Your Salesient Login Code",
      react: EmailTemplate({ otp, magicLink }),
    });

    if (error) {
      console.error("Email send error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}
