import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";
import { db } from "@/db"; // your drizzle instance
import { serverEnv } from "@/env";

const resend = new Resend(serverEnv.RESEND_API_KEY);
const defaultAuthBaseURL = "http://localhost:3000";
const configuredAuthBaseURL = (
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  defaultAuthBaseURL
).replace(/\/$/, "");
const trustedAuthOrigins = Array.from(
  new Set([configuredAuthBaseURL, defaultAuthBaseURL])
);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  baseURL: configuredAuthBaseURL,
  trustedOrigins: trustedAuthOrigins,
  socialProviders: {
    google: {
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url, token }) => {
        const fromAddress = "Salesient <onboarding@resend.dev>";
        try {
          const { error } = await resend.emails.send({
            from: fromAddress,
            to: [email],
            subject: "Your Salesient Magic Link",
            react: EmailTemplate({ otp: token, magicLink: url }),
          });

          if (error) {
            throw new Error(error.message || "Failed to send magic link email");
          }
        } catch (error) {
          console.error("Failed to send magic link email:", error);
          const message =
            error instanceof Error
              ? error.message
              : "Failed to send magic link email";
          throw new Error(message);
        }
      },
    }),
  ],
});
