import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const getAuthClientBaseURL = () => {
  const configuredBaseURL =
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredBaseURL) {
    return configuredBaseURL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getAuthClientBaseURL(),
  plugins: [magicLinkClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
