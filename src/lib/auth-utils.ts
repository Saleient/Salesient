import { config } from "dotenv";
import { headers } from "next/headers";
import type { User } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  createSessionKey,
  extractSessionToken,
  sessionCache,
} from "./performance-cache";

config({
  path: ".env.local",
});

export type AuthSession = { user?: User | null } | null;

export const getSession = async (): Promise<AuthSession> => {
  const requestHeaders = await headers();
  const sessionToken = extractSessionToken(requestHeaders);

  // Try cache first (only if we have a session token)
  if (sessionToken) {
    const cacheKey = createSessionKey(sessionToken);
    const cached = sessionCache.get(cacheKey);
    if (cached) {
      return cached as AuthSession;
    }
  }

  const session = (await auth.api.getSession({
    headers: requestHeaders,
  })) as AuthSession;

  // Only cache valid sessions with users
  if (sessionToken && session?.user) {
    const cacheKey = createSessionKey(sessionToken);
    sessionCache.set(cacheKey, session);
  }

  return session;
};

export const getUser = async (): Promise<User | null> => {
  const session = await getSession();
  return session?.user ?? null;
};
