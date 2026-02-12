import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// IMPORTANT: Never expose all of process.env to the client.
// Only expose variables that are explicitly safe & needed client-side.
export const serverEnv = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GOOGLE_API_KEY: z.string().min(1),
    MISTRAL_API_KEY: z.string().min(1).optional(),
    FIRECRAWL_API_KEY: z.string().min(1),
    // AI Microservice
    AI_MICROSERVICE_URL: z.string().url().default("http://localhost:8000"),
    AI_MICROSERVICE_TIMEOUT: z.coerce.number().default(30000),
    AI_MICROSERVICE_RETRIES: z.coerce.number().default(3),
    // Cloudflare R2 storage (server only)
    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_BUCKET: z.string().min(1).default("salesorbit"),
    // Composio integrations (server only)
    COMPOSIO_API_KEY: z.string().min(1),
    // Memory layer (Mem0 OSS)
    MEM0_DB_PATH: z.string().min(1).default("/tmp/memory.db"),
    // Embeddings
    EMBEDDINGS_DIMENSION: z.coerce.number().default(768),
    // Supermemory API key
    SUPERMEMORY_API_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
  },
  client: {
    // Public-facing URLs (optional). These MUST start with NEXT_PUBLIC_ prefix.
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1),
    NEXT_PUBLIC_POSTHOG_HOST: z
      .string()
      .min(1)
      .default("https://us.i.posthog.com"),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
});
