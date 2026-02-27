import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";
import { db } from "@/db"; // your drizzle instance
import { serverEnv } from "@/env";

const resend = new Resend(serverEnv.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://www.salesorbit.xyz"
      : "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "https://www.salesorbit.xyz",
    "https://salesorbit.xyz",
  ],
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
        try {
          await resend.emails.send({
            from: "Salesient <noreply@salesorbit.xyz>",
            to: [email],
            subject: "Your Salesient Magic Link",
            react: EmailTemplate({ otp: token, magicLink: url }),
          });
        } catch (error) {
          console.error("Failed to send magic link email:", error);
          throw error;
        }
      },
    }),
  ],
});
