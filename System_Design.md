# Salesient — System Design Document

> Deep-dive engineering documentation. Audience: technical interviewers, new engineers, and code reviewers. Every claim in this document is grounded in source code with file/line references.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack & Why](#2-tech-stack--why)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Repository Layout](#4-repository-layout)
5. [Authentication Subsystem](#5-authentication-subsystem)
6. [Middleware / Request Gating (`proxy.ts`)](#6-middleware--request-gating-proxyts)
7. [Database Schema (Drizzle + Postgres + pgvector)](#7-database-schema-drizzle--postgres--pgvector)
8. [The AI Microservice Boundary (FastAPI side-car)](#8-the-ai-microservice-boundary-fastapi-side-car)
9. [Chat Subsystem — End-to-End Deep Dive](#9-chat-subsystem--end-to-end-deep-dive)
10. [The Tool Registry — All 10+ Tools Explained](#10-the-tool-registry--all-10-tools-explained)
11. [RAG Pipeline](#11-rag-pipeline)
12. [Document Ingestion Pipeline](#12-document-ingestion-pipeline)
13. [Composio Integrations & MCP](#13-composio-integrations--mcp)
14. [Memory Layer (Supermemory)](#14-memory-layer-supermemory)
15. [Personalized Prompts + Hourly Cron](#15-personalized-prompts--hourly-cron)
16. [Performance Cache](#16-performance-cache)
17. [Observability (Axiom + PostHog)](#17-observability-axiom--posthog)
18. [Storage Layer (Cloudflare R2)](#18-storage-layer-cloudflare-r2)
19. [UI Composition](#19-ui-composition)
20. [Environment & Configuration](#20-environment--configuration)
21. [Security Model](#21-security-model)
22. [Critical Design Decisions & Trade-offs](#22-critical-design-decisions--trade-offs)
23. [Known Issues & Areas of Improvement](#23-known-issues--areas-of-improvement)
24. [Interview Cheat-Sheet — Likely Questions](#24-interview-cheat-sheet--likely-questions)

---

## 1. Executive Summary

**Salesient** is a production AI sales assistant. The personality is "Elie" — a sales-focused agent that qualifies leads, surfaces context from the user's documents and CRM, and pushes toward a call-to-action.

Concretely, the system fuses **four sources of truth** into a single chat experience:

| Source | Mechanism |
|---|---|
| User's uploaded files (PDF/DOCX/PPTX/XLSX/CSV/TXT/MD/images) | RAG (pgvector + 768-D embeddings) |
| User's connected CRM/Drive/HRMS/email apps (120+ via Composio) | MCP tool router → dynamic tools per chat session |
| Live web | Firecrawl (scrape one URL) + Firesearch (search the web) |
| Persistent conversational memory | Supermemory, scoped per-user via container tags |

The orchestrator is a **single `streamText()` call** in [src/app/api/chat/route.ts](src/app/api/chat/route.ts) bounded by `stepCountIs(10)` — the model runs up to 10 reasoning/tool-call steps per message. The Vercel AI SDK handles streaming, tool invocation, and tool-result feedback automatically.

**Headline architectural choice:** heavy AI compute (embeddings, OCR, CSV row→sentence, title generation) is offloaded to a **separate FastAPI microservice** ([src/lib/ai-microservice/](src/lib/ai-microservice/)). The Next.js process is stateless beyond its DB connection; the microservice is stateless beyond its model clients. All persistent state — chat history, file metadata, embeddings, user prefs — lives in Neon Postgres.

---

## 2. Tech Stack & Why

### Application Framework
- **Next.js 16** (App Router) with **React 19** — server components for protected pages, route handlers for the API surface, server actions in `src/queries/*` for typed DB mutations.
- **TypeScript strict mode** with path alias `@/*`.

### Database & ORM
- **Neon Postgres** (serverless HTTP driver `@neondatabase/serverless`) — chosen for cold-start friendliness and serverless connection pooling.
- **Drizzle ORM** (`drizzle-orm` + `drizzle-kit`) — typed schema, lightweight runtime, native `pgvector` support.
- **pgvector** extension — `vector(768)` column with cosine distance operator `<=>`.

### Auth
- **Better Auth 1.3** with Drizzle adapter, **Google OAuth** social provider, **email+password**, and the **magic-link plugin** (delivered via Resend + React Email template).

### AI Layer
- **Vercel AI SDK** (`ai@5.0.87`) — provider-agnostic streaming, tool calling, `streamText()` step loop.
- **Provider:** `@ai-sdk/google` — `gemini-2.5-flash` for chat. Other providers (`mistral`, `openai`, `groq`, `cerebras`, `xai`) are wired up but not actively used.
- **MCP** (`@ai-sdk/mcp` + `@modelcontextprotocol/sdk`) — model-context-protocol client over StreamableHTTP transport, fed by Composio's tool router.
- **FastAPI AI microservice** (external) — embeddings, OCR (Gemini vision), CSV column-mapping, title generation.

### Integrations / Memory
- **Composio** (`@composio/core` + `@composio/vercel`) — single API to OAuth into 120+ SaaS apps; tools auto-exposed via MCP.
- **Supermemory** (`@supermemory/tools`) — managed conversational memory layer.

### Storage
- **Cloudflare R2** via the AWS S3 SDK (`@aws-sdk/client-s3` + presigner). Note: the wrapper file is misleadingly named [src/lib/minio.ts](src/lib/minio.ts) — historical name, R2 in production.

### Observability
- **Axiom** (`@axiomhq/nextjs`) — structured server logs, middleware request tracing.
- **PostHog** — product analytics + session replay.

### UI
- **Tailwind CSS 4**, **Radix UI** + **shadcn/ui** components, **CVA** for variants, **Motion** (formerly Framer Motion) for animations, **Lenis** for smooth scroll, **Shiki** for code highlighting, **Sonner** for toasts.

### Tooling
- **Biome 2.3** (replaces ESLint + Prettier) + **Ultracite** rule pack.
- **Husky + lint-staged** for pre-commit format.
- **`tsx`** for executing TS scripts (e.g., the cron prompt regeneration trigger).

---

## 3. High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ BROWSER                                                                         │
│   Next.js 16 App Router (RSC + client islands)                                  │
│   useStreamingChat() hook decodes SSE → renders streaming text, reasoning,      │
│   tool calls via ai-elements/* components                                       │
└──────────────────────────────┬─────────────────────────────────────────────────┘
                               │  HTTPS / SSE
┌──────────────────────────────▼─────────────────────────────────────────────────┐
│ NEXT.JS SERVER (proxy.ts gate → route handlers + server actions)                │
│                                                                                 │
│   /api/chat              → THE BRAIN. streamText() + 10 tools + MCP            │
│   /api/documents/*       → upload, list, projects, files                       │
│   /api/apps/connection   → list/disconnect Composio accounts                   │
│   /api/integrations/*    → toolkit metadata                                    │
│   /api/settings/*        → profile, prefs, export, delete                      │
│   /api/cron/regenerate-prompts → hourly job                                    │
│   /api/auth/[...all]     → Better Auth catch-all                               │
│                                                                                 │
│   queries/* (server actions): chat.ts, files.ts, projects.ts                   │
└──┬──────────┬──────────┬──────────┬───────────┬──────────┬─────────────────────┘
   │          │          │          │           │          │
   ▼          ▼          ▼          ▼           ▼          ▼
┌──────┐ ┌────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐
│ Neon │ │ R2     │ │ Composio │ │ FastAPI  │ │ Super- │ │ Gemini   │
│ PG + │ │ (S3)   │ │ (MCP +   │ │ AI µ-svc │ │ memory │ │ via @ai- │
│ pg-  │ │ binary │ │ OAuth)   │ │ (embed,  │ │ (mem   │ │ sdk      │
│vector│ │ blobs  │ │ 120 apps │ │ OCR,     │ │ search │ │ google)  │
└──────┘ └────────┘ └──────────┘ │ title)   │ │ + add) │ └──────────┘
                                 └──────────┘ └────────┘
                                       │
                              ┌────────▼─────────┐
                              │ Gemini 2.5 Flash │
                              │ (embeddings &    │
                              │  OCR underneath) │
                              └──────────────────┘

Sidecar services:
   - Axiom (structured logging)
   - PostHog (analytics + session replay)
   - Resend (transactional email — magic links)
```

**Key invariants:**
1. **Next.js owns durable state.** The microservice never writes to the DB.
2. **Composio sessions are per-`(userId, chatId)`** and cached in-process (`Map`) for the chat lifetime.
3. **The model is the orchestrator** — there is no hand-coded chain. Everything is "give the model these tools, let it choose."

---

## 4. Repository Layout

```
salesient/
├── drizzle/                          # SQL migrations + meta journal
├── scripts/                          # one-off TS scripts
├── docs/                             # supplemental docs
├── public/                           # static assets
├── src/
│   ├── ai/
│   │   ├── index.ts                  # Gemini + Mistral provider factories
│   │   └── tools/                    # 7 in-process AI tools (see §10)
│   │       ├── firecrawl.ts          # scrape URL → markdown
│   │       ├── firesearch.ts         # web search (multi-category)
│   │       ├── rag.ts                # GLOBAL_RAG_SEARCH
│   │       ├── local-rag.ts          # LOCAL_RAG_SEARCH (project/file scoped)
│   │       ├── smart-file-reader.ts  # cloud-file workflow router
│   │       ├── composio-file-processor.ts  # cloud-file → R2 → embed → DB
│   │       └── memory.ts             # Supermemory wrapper
│   │
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/login              # public auth surface
│   │   ├── (default)/                # public marketing (home, pricing, faq, …)
│   │   ├── (product)/                # authenticated product
│   │   │   ├── dashboard/
│   │   │   │   ├── chat/[id]
│   │   │   │   ├── chat/new
│   │   │   │   ├── documents/{,[slug]}
│   │   │   │   └── integrations
│   │   │   └── settings
│   │   └── api/                      # all REST endpoints (see §3 diagram)
│   │
│   ├── components/
│   │   ├── ai-elements/              # streaming-aware UI primitives
│   │   ├── sections/                 # marketing + chat composition
│   │   ├── ui/                       # shadcn/Radix primitives
│   │   ├── app-sidebar.tsx
│   │   ├── nav-main.tsx
│   │   └── email-template.tsx        # magic-link React Email
│   │
│   ├── db/
│   │   ├── index.ts                  # neon + drizzle init
│   │   └── schema.ts                 # ALL table definitions
│   │
│   ├── env/index.ts                  # t3-env zod-validated env
│   ├── hooks/                        # useStreamingChat, useProjects, use-mobile
│   ├── lib/
│   │   ├── ai-microservice/          # FastAPI client (config/client/types/stream-parser/errors)
│   │   ├── axiom/                    # logger (client + server)
│   │   ├── auth.ts                   # Better Auth config
│   │   ├── auth-client.ts            # Better Auth React client
│   │   ├── auth-utils.ts
│   │   ├── compostio.ts              # (sic) Composio factory
│   │   ├── data.ts                   # static UI data
│   │   ├── embeddings.ts             # generate / chunk / cosine helpers
│   │   ├── file-processing.ts        # PDF/DOCX/PPTX/XLSX/CSV/TXT/MD/img
│   │   ├── minio.ts                  # Cloudflare R2 client (S3-compatible)
│   │   ├── performance-cache.ts      # LRU-ish in-memory cache class
│   │   ├── personalized-prompts.ts   # quick-prompt generator + cron writer
│   │   └── utils.ts                  # cn(), getIntegrationLogoBase64()
│   │
│   ├── prompts/prompts.ts            # baseAssistantPrompt + primaryContextPrompt
│   ├── proxy.ts                      # middleware (auth gate + Axiom log)
│   ├── instrumentation.ts            # Next.js onRequestError hook
│   ├── instrumentation-client.ts     # client-side instrumentation
│   └── queries/
│       ├── chat.ts                   # chat + message CRUD server actions
│       ├── files.ts                  # full file lifecycle
│       └── projects.ts               # folder/project CRUD
│
├── biome.json, tsconfig.json, next.config.ts, drizzle.config.ts
├── docker-compose.yml                # local dev infra
└── package.json
```

---

## 5. Authentication Subsystem

### Configuration — [src/lib/auth.ts](src/lib/auth.ts)

```ts
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  baseURL: configuredAuthBaseURL,
  trustedOrigins: trustedAuthOrigins,
  socialProviders: {
    google: { clientId: ..., clientSecret: ... },
  },
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url, token }) => {
        await resend.emails.send({
          from: "Salesient <onboarding@resend.dev>",
          to: [email],
          subject: "Your Salesient Magic Link",
          react: EmailTemplate({ otp: token, magicLink: url }),
        });
      },
    }),
  ],
});
```

**Three auth strategies live in parallel:**
1. Google OAuth (one-click).
2. Email + password (no verification gate).
3. Magic link via Resend (passwordless).

### Tables (managed by Better Auth, see [src/db/schema.ts](src/db/schema.ts))
- `user` — `id`, `email` (unique), `emailVerified`, `image`, timestamps.
- `session` — `token` (unique), `expiresAt`, `ipAddress`, `userAgent`, `userId` FK → cascade.
- `account` — provider linkage with `accessToken`, `refreshToken`, `idToken`, `accessTokenExpiresAt`, etc.
- `verification` — ephemeral codes for magic links / email verification.

### Session retrieval pattern (used everywhere)
```ts
const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user) return new Response("Unauthorized", { status: 401 });
```

### `baseURL` resolution

The `BETTER_AUTH_URL` env can override; otherwise it falls back to `NEXT_PUBLIC_APP_URL` → `NEXT_PUBLIC_SITE_URL` → `http://localhost:3000`. Trailing slash is stripped. Both the configured URL and `localhost` are added to `trustedOrigins` to avoid CSRF blocks during dev.

---

## 6. Middleware / Request Gating (`proxy.ts`)

[src/proxy.ts](src/proxy.ts) runs on every request matching `/login`, `/dashboard`, or `/api/*`. It does two things:

```ts
export async function proxy(request: NextRequest) {
  logger.info(...transformMiddlewareRequest(request));     // 1) Axiom log
  const session = await auth.api.getSession({ headers: await headers() });
  const { pathname } = request.nextUrl;

  if (pathname === "/login") {
    if (session?.user) return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/cron/")) {
    return NextResponse.next();  // Better Auth handles its own; cron uses its own secret
  }
  if (pathname.startsWith("/api/") && !session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));  // 302 for browser hits
  }
  if (!session?.user) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}
```

**Gotcha worth knowing for an interview:** redirecting `/api/*` to `/login` returns HTML to fetch clients, which can confuse `fetch()`. The `/api/chat` route handler still does its *own* `getSession()` check and returns a proper 401, so a logged-out fetch hits 401 first.

---

## 7. Database Schema (Drizzle + Postgres + pgvector)

Full schema in [src/db/schema.ts](src/db/schema.ts). Here's the entity map:

```
┌─ user ──────────────────────────────┐
│  id, email(unique), name, image     │
└──┬───┬───┬───┬───┬───┬───┬──────────┘
   │   │   │   │   │   │   │
   ▼   ▼   ▼   ▼   ▼   ▼   ▼
session account chat folder fileUpload subscription messageUsage userPreferences
                │     │       │            ↓ cascade
                │     │ cascade            └─ documentChunk(embedding vector(768))
                │     │
                │     └─ fileUpload(folder_id, …)
                │
                └─ message(chat_id) ON DELETE CASCADE
```

### `chat` & `message`

```ts
export const chat = pgTable("chat", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  userId: text("user_id").notNull().references(() => user.id),
  title: text("title").notNull().default("New Chat"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  attachments: json("attachments").notNull().default([]),
});

export const message = pgTable("message", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  chatId: text("chat_id").notNull().references(() => chat.id, { onDelete: "cascade" }),
  role: text("role").notNull(),            // 'user' | 'assistant' | 'tool'
  content: text("content"),                // raw text (denormalized for fast read)
  parts: json("parts").notNull(),          // structured: text | tool-call | tool-result
  attachments: json("attachments").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  inputTokens: integer("input_tokens"),    // populated in onFinish
  outputTokens: integer("output_tokens"),
  totalTokens: integer("total_tokens"),
  completionTime: real("completion_time"),
  sequence: integer("sequence").notNull(), // strict ordering even when createdAt ties
});
```

The `parts` JSON column is the canonical representation. Example part shapes:
```jsonc
[
  { "type": "text", "text": "Hello!" },
  {
    "type": "tool-invocation",
    "toolInvocation": {
      "toolCallId": "call_abc",
      "toolName": "GLOBAL_RAG_SEARCH",
      "args": { "query": "Q3 revenue" },
      "state": "result",
      "result": { "chunks": [...], "context": "..." }
    }
  }
]
```

### `fileUpload` & `documentChunk` (the RAG core)

```ts
export const fileUpload = pgTable("file_upload", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  folderId: text("folder_id").references(() => folder.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  filePath: text("file_path").notNull(),         // R2 object key
  integrationName: text("integration_name"),     // 'onedrive' | 'gdrive' | ...
  integrationLogo: text("integration_logo"),     // base64 PNG for UI
  imageBase64: text("image_base64"),             // small images stored inline
  extractedText: text("extracted_text"),         // post-OCR/parse cache
  createdAt, updatedAt,
});

export const documentChunk = pgTable("document_chunk", {
  id: text("id").primaryKey(),
  fileId: text("file_id").notNull().references(() => fileUpload.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 768 }).notNull(),
  metadata: json("metadata").default({}),
  createdAt,
}, (table) => ({
  userIdIdx: index("document_chunk_user_id_idx").on(table.userId),
  fileIdIdx: index("document_chunk_file_id_idx").on(table.fileId),
}));
```

**Important:** indexes on `userId` and `fileId` make per-user / per-file lookups fast. There is **no IVFFlat / HNSW vector index yet** — vector search is exact over the user's chunks (acceptable while corpora are small).

### Cascade rules — interview gotcha
- `message → chat ON DELETE CASCADE` — deleting a chat purges messages.
- `documentChunk → fileUpload → user ON DELETE CASCADE` — deleting a user wipes their files and embeddings cleanly (GDPR-friendly).
- `fileUpload.folderId → folder ON DELETE CASCADE` — deleting a project removes its files (and via chain, their chunks).
- However, deleting from R2 is **manual** in [src/queries/files.ts](src/queries/files.ts) (`deleteFromMinIO()` is called in `deleteFile()` / `deleteFolder()`). DB cascade alone leaves orphan blobs.

### `userPreferences`

```ts
export const userPreferences = pgTable("user_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => user.id, { onDelete: "cascade" }),
  systemPreferences: json("system_preferences").default({ customSystemPrompt: "" }),
  prompts: json("prompts").notNull().default([]).$type<Array<{ title; prompt; category? }>>(),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),      // hourly TTL for prompts
  metadata: json("metadata").default({ fileCount: 0, folderCount: 0, chatCount: 0, hasIntegrations: false }),
  createdAt, updatedAt,
});
```

Two roles: (a) user's custom system prompt (injected into chat), (b) cached quick-prompts shown on the new-chat screen, regenerated hourly.

---

## 8. The AI Microservice Boundary (FastAPI side-car)

> The README doesn't document this — it's one of the most important architectural facts to mention in an interview.

### Why a separate service?
- **Avoid Node's weakness for ML libraries.** Embedding generation, OCR, and CSV semantic conversion live more naturally in Python with first-class Google/Anthropic/Mistral SDKs and tokenizers.
- **Independent scaling.** File processing is bursty; chat is sustained. They scale differently.
- **Process isolation.** A long-running OCR doesn't tie up the Next.js node process.

### Client — [src/lib/ai-microservice/client.ts](src/lib/ai-microservice/client.ts)

Exposes a typed class with these capabilities:

| Method | Purpose | Endpoint |
|---|---|---|
| `healthCheck()` | Latency probe | `GET /health` |
| `chatStream(req)` | Stream chat tokens | `POST /api/v1/chat` |
| `ragSearch(req)` / `localRagSearch(req)` | Hosted RAG ranking | `POST /api/v1/rag-search`, `/local-rag-search` |
| `processFile(file)` / `processFiles(files)` | Extract+chunk+embed | `POST /api/v1/process-file{,s}` (multipart) |
| `embedMany(req)` / `embedOne(text)` | Generate 768-D vectors | `POST /api/v1/embeddings` |
| `performOcr(req)` | PDF/image → text | `POST /api/v1/file-processing/ocr` |
| `generateColumnMappings(req)` | CSV header → canonical | `POST /api/v1/file-processing/column-mappings` |
| `convertRowToSentence(req)` | CSV row → NL sentence | `POST /api/v1/file-processing/row-to-sentence` |
| `generateText(req)` | One-shot text gen | `POST /api/v1/generate-text` |

### Retry semantics

```ts
private async retryableRequest<T>(url, options): Promise<T> {
  for (let attempt = 0; attempt < this.maxRetries; attempt++) {
    try { ...fetch with AbortSignal.timeout(this.timeout)... }
    catch (error) {
      if (error.statusCode >= 400 && error.statusCode < 500) throw error;  // don't retry 4xx
      lastError = error;
      if (attempt < this.maxRetries - 1) await this.sleep(2 ** attempt * 1000);  // exp backoff
    }
  }
  throw lastError;
}
```

- 3 retries default, exponential backoff (1s, 2s, 4s).
- 4xx errors short-circuit (don't retry client errors).
- Streaming and file-processing use longer dedicated timeouts (120s / 300s).

### Stream protocol — [src/lib/ai-microservice/stream-parser.ts](src/lib/ai-microservice/stream-parser.ts)

Line-prefixed events:
```
0:{"content":"..."}    → text delta
2:{"content":"..."}    → reasoning delta
9:{"toolCallId":"...","toolName":"...","args":{}}    → tool call start
a:{"toolCallId":"...","result":{}}                   → tool call result
```

Two utilities ship:
- `consumeChatStream(stream, handler)` — push-based callback model.
- `createTextDeltaStream(source)` — pipes only `0:` text events into a Web `ReadableStream<string>`.

> Right now the live `/api/chat` route uses the **Vercel AI SDK directly with Gemini** (not the microservice chat endpoint), but the microservice is wired in for: title generation, embeddings, OCR, and CSV processing. The chat-stream client exists for future migration.

---

## 9. Chat Subsystem — End-to-End Deep Dive

This is the heart of the system. File: [src/app/api/chat/route.ts](src/app/api/chat/route.ts) (≈800 lines).

### 9.1 The Request Lifecycle

```
1. Browser: useStreamingChat.sendMessage(content, files, chatId)
   ↓ POST /api/chat { messages, id }
2. proxy.ts middleware: auth check + Axiom log
3. /api/chat POST handler:
   a. auth.api.getSession() → 401 if missing
   b. zod parse body (id, messages, optional enabledToolkits)
   c. getChatById(chatId) → 403 if not owner
   d. getMessagesByChatId(chatId) → DB is source of truth, NOT request body
   e. If chat.title === "New Chat" → fire-and-forget title generation
   f. getOrCreateMCPSession(`${userId}-${chatId}`, userEmail)
      → Composio toolRouter.createSession → StreamableHTTPClientTransport
   g. Load userPreferences.systemPreferences.customSystemPrompt
   h. Build systemPrompt = "Current time...\n" + primaryContextPrompt(custom) + baseAssistantPrompt
   i. Assemble tools = { ...mcpTools, list_composio_tools, firecrawl, firesearch,
                         GLOBAL_RAG_SEARCH, LOCAL_RAG_SEARCH, SMART_FILE_READER,
                         COMPOSIO_FILE_PROCESSOR, search_memories, add_memory }
   j. Convert DB messages → CoreMessage[] (preserve tool-invocation parts)
   k. streamText({ model: gemini-2.5-flash, system, messages, tools,
                   stopWhen: stepCountIs(10), maxOutputTokens: 4096, temperature: 0.5,
                   onFinish: persist assistant + record token usage })
   l. Return result.toUIMessageStreamResponse({ originalMessages })  // SSE
4. Browser: useStreamingChat reader parses 0:/2:/9:/a: lines and JSON events,
   updates streamingContent, streamingToolCalls, streamingReasoning
5. onFinish (server): saveChatMessages → addMessageToChat (with dedup signature)
```

### 9.2 Source-of-truth model

The frontend writes the user message into the DB *before* calling `/api/chat`. The route therefore **discards** the incoming `messages` and re-reads from the DB:

```ts
// Use DB messages as source of truth since frontend saves before calling API
let messages = dbMessages.map((m) => ({
  id: m.id,
  role: m.role,
  content: m.content || "",
  parts: Array.isArray(m.parts) ? m.parts : [],
  attachments: Array.isArray(m.attachments) ? m.attachments : [],
}));
if (messages.length === 0 && incomingMessages?.length > 0) {
  messages = incomingMessages;  // fallback
}
```

**Why:** prevents replay attacks, hand-edited request bodies, and resync races between optimistic UI and storage.

### 9.3 MCP Session Cache

```ts
const sessionCache = new Map<string, MCPSessionCache>();

async function getOrCreateMCPSession(sessionKey, userEmail) {
  if (sessionCache.has(sessionKey)) {
    const cached = sessionCache.get(sessionKey);
    return { client: cached.client, tools: cached.tools };
  }
  const composio = getComposio();
  const mcpSession = await composio.experimental.toolRouter.createSession(userEmail);
  const mcpClient = await createMCPClient({
    transport: new StreamableHTTPClientTransport(new URL(mcpSession.url), {
      sessionId: mcpSession.sessionId,
    }),
  });
  const fetchedTools = await mcpClient.tools();
  const mcpTools = { ...fetchedTools, REQUEST_USER_INPUT: createRequestUserInputTool() };
  sessionCache.set(sessionKey, { session: mcpSession, client: mcpClient, tools: mcpTools });
  return { client: mcpClient, tools: mcpTools };
}
```

**Why module-level `Map`:** keeps the MCP TCP/SSE connection warm across messages in the same chat (huge latency win — avoids re-initiating the tool router every turn). Trade-off: it's only "per process" in a serverless world, so on cold start the first message pays the connection cost.

### 9.4 System Prompt Construction

The system prompt is **layered** ([route.ts:586-599](src/app/api/chat/route.ts#L586-L599)):

```ts
let systemPrompt = `Current time (UTC): ${currentTimeIso}\n\n`;

systemPrompt += primaryContextPrompt(
  customPrompt?.trim().length
    ? customPrompt
    : "No specific business context has been configured for this user."
);

systemPrompt += baseAssistantPrompt;
```

- **Layer 1:** Current time (so the model can reason about "yesterday" / "next week").
- **Layer 2:** `primaryContextPrompt(customPrompt)` from [src/prompts/prompts.ts](src/prompts/prompts.ts) — wraps the user's free-form business context in a strong-emphasis preamble.
- **Layer 3:** `baseAssistantPrompt` — the "Elie" persona, the core rules (always check primary context, always end with `add_memory`, hide tool/reasoning output), reasoning chain-of-thought structure, file workflow, and tool examples.

The model is **explicitly told** to call `add_memory` at the end of every response, to check `search_memories` first, and to use `LOCAL_RAG_SEARCH` whenever it sees `[ATTACHED FILES: ...]` markers.

### 9.5 Attachments → tool inputs

`convertMessageToCoreFormat()` ([route.ts:219-268](src/app/api/chat/route.ts#L219-L268)) appends synthetic text parts so the model can see which files/projects are attached:

```ts
function buildAttachmentInfo(attachments) {
  const fileAttachments = attachments.filter(a => a.type === "file");
  const projectAttachments = attachments.filter(a => a.type === "project");
  let info = "";
  if (fileAttachments.length > 0) {
    info += `\n\n[ATTACHED FILES: ${fileAttachments.map(a => a.id).join(", ")}]`;
    info += `\n[FILE NAMES: ${fileAttachments.map(a => a.name).join(", ")}]`;
  }
  if (projectAttachments.length > 0) {
    info += `\n\n[ATTACHED PROJECTS: ${projectAttachments.map(a => a.id).join(", ")}]`;
    info += `\n[PROJECT NAMES: ${projectAttachments.map(a => a.name).join(", ")}]`;
  }
  return info;
}
```

The base prompt then instructs the model: *"if you see `[ATTACHED FILES: ...]`, call `LOCAL_RAG_SEARCH` with those exact IDs."*

### 9.6 `stopWhen: stepCountIs(10)`

`streamText()` runs an inner loop: model → tool call → tool result → model. `stepCountIs(10)` caps that loop at 10 steps. Prevents:
- runaway tool-call loops (model keeps calling `firesearch` forever)
- accidental cost explosions
- request timeouts

### 9.7 Persisting the assistant response

In `onFinish` ([route.ts:653-674](src/app/api/chat/route.ts#L653-L674)):
1. Record token usage + completion time.
2. Pull the latest assistant message from `response.messages`.
3. Run a **signature dedup** against the last saved assistant (prevents double-saves on stream retry):

```ts
function createMessageSignature(message) {
  const text = (message.content ?? "").trim();
  const parts = Array.isArray(message.parts) && message.parts.length > 0
    ? stableStringify(message.parts) : "";
  return `${text}::${parts}`;
}
// stableStringify sorts object keys deterministically → safe to hash/compare
```
4. Insert via `addMessageToChat()` with auto-assigned `sequence` (one more than `max(sequence)`).

### 9.8 Client-side stream decoder

[src/hooks/useStreamingChat.ts](src/hooks/useStreamingChat.ts) handles **two** stream formats in the same loop:
- **JSON events** (newer AI SDK): `text-delta`, `reasoning-delta`, `tool-input-start`, `tool-input-available`, `tool-output-available`.
- **Data Stream Protocol** (`0:` / `2:` / `9:` / `a:`).

This dual handling exists because the chat route uses `result.toUIMessageStreamResponse()` which emits the JSON format, but legacy code paths and the microservice both use the prefixed format. The hook tries JSON first; if `JSON.parse` fails, falls through to prefix parsing.

It maintains three reactive state slots:
- `streamingContent` — accumulating assistant text
- `streamingToolCalls` — tool call list with `state: "running" | "result"` and result blob
- `streamingReasoning` — chain-of-thought thinking text (if the model emits it)

> **Production gate:** tool calls are rendered only in `NODE_ENV !== "production"` to keep the UI clean for end users (the model is told to "hide reasoning/tools" in the system prompt too).

---

## 10. The Tool Registry — All 10+ Tools Explained

The model has access to all of these at every turn. The system prompt tells it when to use each.

### 10.1 `firecrawl` — [src/ai/tools/firecrawl.ts](src/ai/tools/firecrawl.ts)
Scrape one URL → markdown + metadata (title, description, author, image, language). Uses Firecrawl's `/scrape` endpoint with `formats: ["markdown"]`. Returns a uniform `{ url, content, title, description, ... }` plus `response_time`.

### 10.2 `firesearch` — [src/ai/tools/firesearch.ts](src/ai/tools/firesearch.ts)
Web search across multiple categories (web, news, reddit, youtube, github, arxiv, tweets). De-duplicates by URL, derives favicons via Google's S2 service, slices to `limit` (default 5).

### 10.3 `GLOBAL_RAG_SEARCH` — [src/ai/tools/rag.ts](src/ai/tools/rag.ts)
Semantic search over **all** of the user's `documentChunk` rows. The interesting query:

```ts
const similarChunks = await db
  .select({
    id: documentChunk.id,
    content: documentChunk.content,
    metadata: documentChunk.metadata,
    similarity: sql<number>`(1 - (${documentChunk.embedding} <=> ${queryEmbedding}::vector)) AS similarity`,
  })
  .from(documentChunk)
  .where(sql`${documentChunk.userId} = ${userId}`)
  .orderBy(sql`${documentChunk.embedding} <=> ${queryEmbedding}::vector`)
  .limit(topK);
```

- `<=>` is pgvector's cosine **distance** (0 = identical, 2 = opposite). `1 - distance = similarity`.
- Filters by `minSimilarity` (default 0.5) after the limit.
- Returns formatted context block + raw chunk previews + similarity percentages.

### 10.4 `LOCAL_RAG_SEARCH` — [src/ai/tools/local-rag.ts](src/ai/tools/local-rag.ts)
Same engine as global RAG but scoped to `projectIds` and/or `fileIds`:

```ts
// Resolve project IDs → file IDs (expand folders)
if (projectIds.length > 0) {
  const projectFiles = await db.select({ id: fileUpload.id })
    .from(fileUpload)
    .where(and(eq(fileUpload.userId, userId), inArray(fileUpload.folderId, projectIds)));
  allFileIds.push(...projectFiles.map(f => f.id));
}
allFileIds = [...new Set(allFileIds)];   // dedupe

// Query with file scope
const similarChunks = await db.select({...})
  .from(documentChunk)
  .where(and(
    eq(documentChunk.userId, userId),
    inArray(documentChunk.fileId, allFileIds),
  ))
  .orderBy(sql`${documentChunk.embedding} <=> ${vectorString}::vector`)
  .limit(topK);
```

- Default `topK = 10`, `minSimilarity = 0.4` (lower than global — user explicitly attached these so be generous).
- Decorates context with 📄 file name and 📁 project name from a secondary lookup (`fileNames` + `projectNames`).
- Returns a context block prefixed with `🔥 **ATTACHED DOCUMENT CONTENT** 🔥` and instruction to cite file names — manipulative prompting to get better citations.

### 10.5 `SMART_FILE_READER` — [src/ai/tools/smart-file-reader.ts](src/ai/tools/smart-file-reader.ts)
**Not a fetcher** — a workflow router. When the user mentions a cloud file (OneDrive, GDrive, Dropbox, Box, S3, SharePoint, Notion), the model calls this with `{ integration, fileId/path/etc, fileName }`. It returns:

```ts
{
  workflow: "two-step",
  instructions: [
    { step: 1, action: "ONEDRIVE_DOWNLOAD_FILE", params: { fileId }, ... },
    { step: 2, action: "COMPOSIO_FILE_PROCESSOR", params: { downloadResponse: "<result from step 1>", ... } }
  ],
  nextAction: "ONEDRIVE_DOWNLOAD_FILE",
  nextActionParams: { fileId },
  quickStart: "First, call ONEDRIVE_DOWNLOAD_FILE with params: ..."
}
```

If a required param is missing (e.g., no `fileId` for OneDrive), it returns **guidance** telling the model to first call the integration's LIST/SEARCH action:

```ts
guidance: {
  message: "Before calling SMART_FILE_READER, you need to obtain the missing parameters...",
  steps: [{ step: 1, action: "ONEDRIVE_LIST_FILES", description: ..., params: ... }]
}
```

The integration table:
| Integration | Download action | Required params |
|---|---|---|
| onedrive | `ONEDRIVE_DOWNLOAD_FILE` | `fileId` |
| googledrive | `GOOGLEDRIVE_DOWNLOAD_FILE` | `fileId` |
| dropbox | `DROPBOX_DOWNLOAD_FILE` | `path` |
| box | `BOX_DOWNLOAD_FILE` | `fileId` |
| s3 | `S3_DOWNLOAD_FILE` | `bucket, key` |
| sharepoint | `SHAREPOINT_DOWNLOAD_FILE` | `siteId, driveId, itemId` |
| notion | `NOTION_EXPORT_PAGE` | `pageId` (exports as PDF) |

### 10.6 `COMPOSIO_FILE_PROCESSOR` — [src/ai/tools/composio-file-processor.ts](src/ai/tools/composio-file-processor.ts)
The receiver for step 2 of the SMART_FILE_READER workflow. Takes the raw download response and runs the full ingestion pipeline:

```
1. Validate user exists (defensive check)
2. Validate folderId if provided
3. De-dupe: skip if (userId, fileName, integrationName) already exists
4. Extract file buffer — tries 10+ shapes (Buffer, base64 string, .content,
   .data, .file, .bytes, .s3url, content.s3url) because every integration
   responds differently
5. Upload to R2 at userId/files/{Date.now()}-{fileName}
6. Detect MIME type from extension
7. processFile() → extracted text + metadata
8. Fetch integration logo (base64) via getIntegrationLogoBase64()
9. Insert fileUpload row
10. chunkText(text, 1024, 256) → array of {content, startIdx, endIdx}
11. generateEmbeddings(contents) → 768-D vectors via microservice
12. Bulk insert documentChunk rows
```

**The buffer-extraction defensive code is the most production-realistic part of the codebase.** Different cloud APIs return blobs in wildly different shapes, and the AI doesn't know what shape Composio returned — so this tool tries every common pattern (including fetching an S3 presigned URL if that's what the integration returned).

### 10.7 `search_memories` & `add_memory` — [src/ai/tools/memory.ts](src/ai/tools/memory.ts)
Thin wrapper around `@supermemory/tools/ai-sdk`:

```ts
export function createMemoryTools(userId: string) {
  return supermemoryTools(serverEnv.SUPERMEMORY_API_KEY, {
    containerTags: [userId],   // every memory tagged by userId → tenant isolation
  });
}
```

The system prompt instructs the model to:
- **First** call `search_memories` to recall prior context.
- **At the end of every response**, call `add_memory` to log key insights (sales stage, pain points, preferences).

This creates a self-improving conversational context that survives across chats.

### 10.8 `list_composio_tools` (defined inline in route.ts)
Meta-tool. The model calls this to discover what's available for a specific integration:

```ts
const listComposioTools = tool({
  description: "List available Composio tools for an integration to plan calls",
  inputSchema: z.object({ integration: z.string() }),
  execute: ({ integration }) => {
    const filtered = Object.keys(mcpTools).filter(t =>
      t.toLowerCase().includes(integration.replace("_", ""))
    );
    return {
      tools: filtered.map(t => ({ name: t, description: mcpTools[t].description || "N/A" })),
      suggestion: `For ${integration}: Prioritize direct read like ${filtered.find(t => t.includes("GET")) || "SEARCH"}.`,
    };
  },
});
```

Useful when the model doesn't know which specific Composio action exists for "send a Salesforce email" vs "create a HubSpot deal".

### 10.9 `REQUEST_USER_INPUT` (defined inline in route.ts)
Auth-config bridge for integrations that need *more than OAuth* — e.g., Pipedrive needs a subdomain, Salesforce needs an instance URL. The model calls this with a field schema:

```ts
{
  type: "user_input_request",
  provider: "pipedrive",
  fields: [{ name: "subdomain", label: "Company Subdomain", type: "text", required: true }],
  authConfigId: "...",
  logoUrl: "..."
}
```

The frontend detects this special marker in tool results and renders a form instead of plain JSON.

### 10.10 The dynamic MCP toolset
On top of all of the above, **everything Composio exposes** for the user's connected accounts is automatically included. If the user has connected HubSpot, `HUBSPOT_CREATE_DEAL`, `HUBSPOT_SEARCH_CONTACTS`, etc. all appear in `tools` and the model can call them directly.

---

## 11. RAG Pipeline

### 11.1 Embeddings layer — [src/lib/embeddings.ts](src/lib/embeddings.ts)

```ts
export async function generateEmbedding(text: string): Promise<number[]> {
  return await aiMicroserviceClient.embedOne(text, "SEMANTIC_SIMILARITY", EMBEDDING_DIMENSION);
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const result = await aiMicroserviceClient.embedMany({
    texts, taskType: "SEMANTIC_SIMILARITY", outputDimensionality: EMBEDDING_DIMENSION,
  });
  return result.embeddings;
}
```

- 768 dimensions (default; configurable via `EMBEDDINGS_DIMENSION` env).
- `SEMANTIC_SIMILARITY` task type — Gemini's embedding model adjusts its output space based on intent.
- Batch endpoint used for chunked files; one-shot for query-time.

### 11.2 Chunking — recursive splitter

`chunkText(text, chunkSize=1024, overlap=256)` walks the text in three passes:
1. Split by `\n\n+` paragraphs.
2. Inside each paragraph, split by sentence-ending punctuation (`(?<=[.!?])\s+`).
3. If a single sentence exceeds `chunkSize`, fall back to word-level splitting.

This preserves **semantic units** (sentences) rather than blindly chopping at character N. The 256-char overlap means adjacent chunks share context (important for queries that straddle chunk boundaries).

### 11.3 Cosine similarity at query time

In Postgres (preferred):
```sql
1 - (embedding <=> query_vector::vector)
```
`<=>` is pgvector's built-in cosine distance operator.

In JS fallback (used by `queryComposioFiles` helper):
```ts
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  const dot = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
  const m1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
  const m2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));
  return (m1 === 0 || m2 === 0) ? 0 : dot / (m1 * m2);
}
```

### 11.4 Threshold tuning

| Tool | Default `topK` | Default `minSimilarity` |
|---|---|---|
| `GLOBAL_RAG_SEARCH` | 5 | 0.5 |
| `LOCAL_RAG_SEARCH` | 10 | 0.4 |

Local is more lenient because the user **explicitly** attached those files — false-positives are less costly. Global is stricter to avoid polluting the answer with unrelated knowledge.

### 11.5 RAG result envelope

The tools don't dump raw chunks back to the model — they wrap context with metadata:

```text
[1] {chunk content}
📍 Source: 📁 Project Name/file.pdf

[2] {chunk content}
📍 Source: 📄 standalone-doc.docx
```

Plus structured arrays for the UI to render citations.

---

## 12. Document Ingestion Pipeline

### 12.1 Two entry points

**Web upload:** `POST /api/documents/upload` ([src/app/api/documents/upload/route.ts](src/app/api/documents/upload/route.ts))
→ multipart `file` + `folderId` → `uploadFile()` server action.

**Cloud integration:** Model calls `SMART_FILE_READER` → integration's download tool → `COMPOSIO_FILE_PROCESSOR`. Same downstream pipeline.

### 12.2 The pipeline (web path) — [src/queries/files.ts](src/queries/files.ts)

```ts
export async function uploadFile(file: FileLike, folderId?: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (!isValidFileType(file.name)) throw new Error("Unsupported file type");

  // 1. R2 upload
  const objectKey = `${userId}/files/${generateId()}/${file.name}`;
  await uploadToMinIO(objectKey, buffer, { "original-name": file.name, "user-id": userId });

  // 2. Extract text (PDF→OCR, DOCX→mammoth, etc.)
  const processed = await processFile(buffer, file.name, file.type);

  // 3. Chunk
  const chunks = chunkText(processed.text, 1024, 256);

  // 4. Embed (best-effort — fail open if microservice down)
  let embeddings: number[][] = [];
  try { embeddings = await generateEmbeddings(chunks.map(c => c.content)); }
  catch (e) { console.warn("Failed to generate embeddings:", e); }

  // 5. Insert file row + chunk rows
  const [newFile] = await db.insert(fileUpload).values({...}).returning();
  if (embeddings.length > 0) {
    await db.insert(documentChunk).values(chunks.map((chunk, idx) => ({
      fileId: newFile.id, userId, content: chunk.content, embedding: embeddings[idx] || [],
      metadata: { source: file.name, startIdx: chunk.startIdx, endIdx: chunk.endIdx, ...processed.metadata },
    })));
  }
  return newFile;
}
```

**Failure modes are graceful:** if processing fails entirely, the file row is still created (so the file appears in the UI and can be re-processed later). If embedding fails, chunks are skipped (file is searchable by name but not semantically).

### 12.3 Per-format processing — [src/lib/file-processing.ts](src/lib/file-processing.ts)

| Format | Library | Method |
|---|---|---|
| PDF | AI microservice OCR | `performOcr(base64, "application/pdf")` (Gemini vision under the hood) |
| Image (JPG/PNG/WEBP/GIF) | AI microservice OCR | Same as PDF, with image MIME type |
| DOCX | `mammoth` | `extractRawText({ buffer })` |
| PPTX | `jszip` | Loads as ZIP, regex-extracts `<a:t>` text from `ppt/slides/slideN.xml` |
| XLSX/XLS | `xlsx` | `read(buffer) → sheet_to_csv` per sheet → CSV pipeline per sheet |
| CSV | `papaparse` + microservice | Parse → generate **column mappings** → convert **each row to a natural-language sentence** via LLM |
| TXT/MD | native | `buffer.toString("utf-8")` |

**The CSV → NL sentence transform is unique.** Instead of embedding raw `"john@x.com,42,Active"` rows that vectorize poorly, each row becomes something like `"John Doe is a 42-year-old active customer with email john@x.com."` — vastly better for semantic search.

### 12.4 MIME type vs extension reconciliation

`resolveFileType()` cross-checks extension and MIME — prefers MIME when the extension is suspicious (e.g., someone renamed `.pdf` to `.txt`). Throws if neither matches a known type. Prevents silently mis-parsing files.

---

## 13. Composio Integrations & MCP

### 13.1 The factory — [src/lib/compostio.ts](src/lib/compostio.ts)

```ts
export const getComposio = () => new Composio({ apiKey: serverEnv.COMPOSIO_API_KEY });
export const getComposioWithVercel = () => new Composio({
  apiKey: serverEnv.COMPOSIO_API_KEY,
  provider: new VercelProvider(),
});
```

### 13.2 Connection management — [src/app/api/apps/connection/route.ts](src/app/api/apps/connection/route.ts)

Hits Composio's REST API directly (not via SDK) to keep dependencies lean:

```ts
// GET — list all connected accounts for this user
const url = `https://backend.composio.dev/api/v3/connected_accounts?user_ids=${encodeURIComponent(userEmail)}`;
const response = await fetch(url, { headers: { "x-api-key": apiKey } });
return NextResponse.json({ connectedAccounts: items });

// DELETE — disconnect an account
await fetch(`https://backend.composio.dev/api/v3/connected_accounts/${accountId}`, {
  method: "DELETE", headers: { "x-api-key": apiKey },
});
```

User identity is `userEmail` (passed as the Composio `userId`). This means **a user's Composio account is keyed by their email**, not their internal `user.id` — important to know if email ever changes.

### 13.3 Tool router via MCP

```ts
const mcpSession = await composio.experimental.toolRouter.createSession(userEmail);
// returns { url, sessionId }

const mcpClient = await createMCPClient({
  transport: new StreamableHTTPClientTransport(new URL(mcpSession.url), {
    sessionId: mcpSession.sessionId,
  }),
});

const fetchedTools = await mcpClient.tools();   // Record<string, Tool>
```

Composio's tool router returns a tailored set of tools based on **which integrations this user has connected**. The AI SDK speaks MCP, so these tools drop into the `tools` record alongside the in-process tools without any glue code.

### 13.4 OAuth flow

The user-facing flow (typical Composio integration):
1. Browser hits `/dashboard/integrations`.
2. User clicks "Connect HubSpot".
3. Frontend opens Composio's OAuth URL in a popup.
4. Composio handles the OAuth dance, stores tokens on its side.
5. Next chat turn → MCP session refetches tool list → HubSpot tools appear.

For integrations needing extra inputs (Pipedrive subdomain, etc.), the model uses `REQUEST_USER_INPUT` to ask the user *before* triggering OAuth.

---

## 14. Memory Layer (Supermemory)

[src/ai/tools/memory.ts](src/ai/tools/memory.ts):

```ts
export function createMemoryTools(userId: string) {
  return supermemoryTools(serverEnv.SUPERMEMORY_API_KEY, {
    containerTags: [userId],
  });
}
```

The `containerTags` parameter enforces **per-user isolation** — memories tagged with `userId` can only be retrieved by tools created with that same tag. This is Supermemory's multi-tenancy mechanism.

The base prompt mandates:
- `search_memories` is called **first** when context might exist.
- `add_memory` is called **at the end of every response** to log insights ("user is evaluating CRMs", "pain point: slow report generation", etc.).

This creates an effective long-term memory across all of a user's chats without ever touching the DB schema for it. The trade-off: it's an external dependency. If Supermemory is down, memory tools fail (model falls back to per-chat context).

---

## 15. Personalized Prompts + Hourly Cron

### 15.1 Generator — [src/lib/personalized-prompts.ts](src/lib/personalized-prompts.ts)

`generatePersonalizedPrompts(userId)`:
1. Counts user's files, folders, chats (`getUserContext`).
2. Pulls last 5 files and last 5 chat titles.
3. Builds a contextual prompt list:
   - "Analyze {latestFileName}"
   - "Search across my documents" (if `fileCount > 0`)
   - "Organize my knowledge base" (if `fileCount > 5`)
   - "Follow up on: {recentChatTitle}" (if exists)
   - "Compare documents in folders" (if `folderCount > 0`)
4. Pads to 6 prompts using `DEFAULT_PROMPTS`.

### 15.2 TTL + write — `updatePersonalizedPrompts(userId)`

```ts
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 1);  // 1-hour TTL

// Upsert into userPreferences.prompts
```

### 15.3 Read path — `getPersonalizedPrompts(userId)`

Lazy regeneration on read:
1. If no row → generate + insert, recurse.
2. If `expiresAt < now` → regenerate + recurse.
3. Else return cached prompts.

### 15.4 Cron — [src/app/api/cron/regenerate-prompts/route.ts](src/app/api/cron/regenerate-prompts/route.ts)

```ts
export async function GET(request: Request) {
  // Optional auth via Bearer token (CRON_SECRET env)
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expiredPrefs = await db.select().from(userPreferences)
    .where(lt(userPreferences.expiresAt, new Date()));

  for (const pref of expiredPrefs) {
    try { await updatePersonalizedPrompts(pref.userId); results.successful++; }
    catch { results.failed++; }
  }
  return NextResponse.json({ results });
}
```

Designed to be called hourly by Vercel Cron / GitHub Actions / external scheduler. `proxy.ts` whitelists `/api/cron/` so it bypasses the auth gate.

**Why both lazy and cron?** Lazy keeps freshness for active users; cron pre-warms inactive users so their next visit is fast.

---

## 16. Performance Cache

[src/lib/performance-cache.ts](src/lib/performance-cache.ts) defines a generic `PerformanceCache<T>` class:

```ts
class PerformanceCache<T> {
  private readonly cache = new Map<string, CacheEntry<T>>();
  constructor(_name, maxSize = 1000, ttlMs = 2 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttl = ttlMs;
    setInterval(() => this.cleanup(), 5 * 60 * 1000);  // 5-min sweep
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.cachedAt > this.ttl) { this.cache.delete(key); return null; }
    entry.accessCount++; entry.lastAccessed = Date.now();
    return entry.data;
  }

  set(key, data) {
    if (this.cache.size >= this.maxSize) this.evictLeastRecentlyUsed();
    this.cache.set(key, { data, cachedAt: Date.now(), accessCount: 1, lastAccessed: Date.now() });
  }
}
```

**Features:**
- TTL with cleanup interval (every 5 min) — no zombie entries.
- LRU eviction when `maxSize` hit.
- Access stats (`accessCount`, `lastAccessed`) for potential hot-key analysis.

**Instances:**
| Cache | Size | TTL | Purpose |
|---|---|---|---|
| `sessionCache` | 500 | 15 min | Better Auth sessions |
| `subscriptionCache` | 1000 | 1 min | Recent subscription state |
| `usageCountCache` | 2000 | 5 min | Message quota counts |
| `proUserStatusCache` | 1000 | 30 min | Pro/free check |
| `paymentCache`, `paymentExpirationCache`, `dodoProStatusCache` | 1000 | 5-30 min | Billing (Dodo Payments) |

Cache key generators (`createSessionKey(token)`, etc.) and `invalidateUserCaches(userId)` for invalidation are provided.

> Caveat: in-process cache means each Next.js node has its own copy. Real consistency would need Upstash Redis (it's in deps but not wired into this cache).

---

## 17. Observability (Axiom + PostHog)

### 17.1 Axiom — [src/lib/axiom/](src/lib/axiom/)
- `server.ts` exposes `logger` for server-side structured logs.
- `client.ts` for browser-side.
- `axiom.ts` initializes the SDK.

[src/proxy.ts](src/proxy.ts) calls `logger.info(...transformMiddlewareRequest(request))` on every request — every request is logged with method, path, status, latency.

[src/instrumentation.ts](src/instrumentation.ts) wires Next.js's `onRequestError` hook:
```ts
export const onRequestError = createOnRequestError(logger);
```
This captures unhandled errors in server components / route handlers → Axiom.

### 17.2 PostHog
- `posthog-js` in the browser → product analytics + session replay.
- `posthog-node` available for server-side event capture.
- `@posthog/ai` package present — likely for capturing LLM events with prompts/usage.

Configured via `NEXT_PUBLIC_POSTHOG_KEY` (required) and `NEXT_PUBLIC_POSTHOG_HOST` (defaults to `https://us.i.posthog.com`).

---

## 18. Storage Layer (Cloudflare R2)

[src/lib/minio.ts](src/lib/minio.ts) — the file is **misnamed historically**; this is the R2 client using the AWS S3 SDK (R2 is S3-compatible).

```ts
const S3 = new S3Client({
  region: "auto",                                          // R2 quirk
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});
```

Exported helpers (function names still say "MinIO"):
- `uploadToMinIO(key, buffer, metadata?)` — `PutObjectCommand`.
- `downloadFromMinIO(key)` — `GetObjectCommand`, streams body into `Buffer.concat()`.
- `listFromMinIO(prefix)` — `ListObjectsV2Command`.
- `deleteFromMinIO(key)` — `DeleteObjectCommand`.
- `getPresignedURL(key, expiry=86400)` — `getSignedUrl()` from `@aws-sdk/s3-request-presigner`, 24h default.

### Path convention
```
{userId}/files/{generateId()}/{originalFileName}
```
- `userId` prefix gives clean per-user namespacing (and easy purge on account deletion via R2's prefix-list API).
- `generateId()` (collision-resistant ID) prevents same-name overwrites.
- Original file name preserved as the last path segment for friendly download URLs.

Cloud-integration uploads follow a slightly different pattern:
```ts
const r2Path = `${userId}/files/${Date.now()}-${fileName}`;  // composio-file-processor.ts
```

> Worth noting in an interview: ideally these conventions would be unified.

---

## 19. UI Composition

### 19.1 Route groups — [src/app/](src/app/)

| Group | Layout | Purpose |
|---|---|---|
| `(auth)` | minimal | Login surface |
| `(default)` | Navbar + Footer + Lenis smooth scroll | Public marketing (home, pricing, faq, contact, integrations showcase) |
| `(product)` | Sidebar + React Query provider + theme provider | Authenticated product (dashboard/chat/documents/integrations/settings) |

### 19.2 Chat surface

`(product)/dashboard/chat/[id]/page.tsx` server-renders chat metadata, then hydrates the client `<Chat>` component which uses `useStreamingChat()`. The chat shell composes:
- `<ChatInput>` — textarea, attach button, send.
- `<MessageList>` — renders each message via `ai-elements/` components.
- `<SearchPanel>` — attach existing projects/files (uses lightweight `getProjectsForSearch` / `getRootFilesForSearch` to avoid loading embeddings).
- Streaming overlays for assistant content / tool calls / reasoning.

### 19.3 `ai-elements/` — streaming primitives

A library of components that know how to render each part type:
- `response.tsx` — markdown-streamed text.
- `tool.tsx` — tool call card (collapsed by default, shows args + result).
- `reasoning.tsx` — chain-of-thought block.
- `sources.tsx`, `inline-citation.tsx` — citation rendering.
- `task.tsx`, `queue.tsx`, `suggestion.tsx`, `actions.tsx`, `toolbar.tsx` — interaction affordances.
- `confirmation.tsx`, `user-input-request.tsx` — handles the `REQUEST_USER_INPUT` tool result and shows a form.
- `shimmer.tsx`, `loader.tsx` — loading states.
- `connection.tsx`, `edge.tsx` — used by `@xyflow/react` for flow visualizations.

### 19.4 Theming & styling
- Tailwind 4 with utility-first.
- `class-variance-authority` for variant-based components (Button, Badge, etc.).
- `tailwind-merge + clsx` via the `cn()` helper in `lib/utils.ts`.
- `next-themes` for dark/light.
- `motion` (Framer Motion successor) for animations.
- `Lenis` for smooth scrolling on marketing pages.

### 19.5 Server actions in queries/

`chat.ts`, `files.ts`, `projects.ts` are marked `"use server"`. They're invoked directly from client components (`async function onClick() { await deleteFile(id); }`). Auth is checked inside each action.

---

## 20. Environment & Configuration

### 20.1 Validated envs — [src/env/index.ts](src/env/index.ts)

Using `@t3-oss/env-nextjs` with zod schemas. Anything missing crashes the app at build time — no silent misconfig.

**Server-only required:**
```
DATABASE_URL                          # Neon Postgres
BETTER_AUTH_SECRET                    # Session encryption
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET  # OAuth
GOOGLE_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY  # Gemini chat & embeddings
FIRECRAWL_API_KEY                     # Web scrape/search
R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
R2_BUCKET                             # default: "salesorbit"
COMPOSIO_API_KEY                      # 120+ integrations
SUPERMEMORY_API_KEY                   # Memory layer
RESEND_API_KEY                        # Email delivery
```

**Server-only optional / defaulted:**
```
MISTRAL_API_KEY                       # optional alternate provider
AI_MICROSERVICE_URL                   # default: http://localhost:8000
AI_MICROSERVICE_TIMEOUT               # default: 30000ms
AI_MICROSERVICE_RETRIES               # default: 3
MEM0_DB_PATH                          # default: /tmp/memory.db (legacy)
EMBEDDINGS_DIMENSION                  # default: 768
```

**Client-exposed (NEXT_PUBLIC_*):**
```
NEXT_PUBLIC_SITE_URL                  # optional
NEXT_PUBLIC_APP_URL                   # optional
NEXT_PUBLIC_POSTHOG_KEY               # required
NEXT_PUBLIC_POSTHOG_HOST              # default: https://us.i.posthog.com
```

**Not in zod schema but referenced in code:** `CRON_SECRET` (cron route), `BETTER_AUTH_URL` (auth baseURL override) — these are read with `process.env.X` directly.

### 20.2 `next.config.ts`

```ts
const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  images: {
    remotePatterns: [
      { hostname: "lh3.googleusercontent.com" },   // Google profile pics
      { hostname: "cdn.jsdelivr.net" },
      { hostname: "logos.composio.dev" },          // integration logos
      { hostname: "fibery.io" },
      { hostname: "github.githubassets.com" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "50mb" },      // file uploads via server actions
  },
};
```

`jiti.import("./src/env/index.ts")` is called at config load to fail fast on invalid env.

### 20.3 Scripts
```
dev        # next dev
build      # next build
start      # next start
lint       # biome check
format     # biome format --write
db:gen     # drizzle-kit generate (diff schema → migration)
db:push    # drizzle-kit push (apply schema directly — dev mode)
prepare    # husky install hooks
```

---

## 21. Security Model

### Authentication & sessions
- All durable session state in `session` table; Better Auth handles rotation & expiry.
- CSRF protection built into Better Auth.
- `trustedOrigins` whitelist in [auth.ts](src/lib/auth.ts).

### Authorization
- Every server action calls `auth.api.getSession()` first.
- Every API route handler calls `auth.api.getSession()` first.
- **Ownership checks** in critical paths: `/api/chat` ([route.ts:526-529](src/app/api/chat/route.ts#L526-L529)), `deleteFile`, `deleteChat`, etc. all verify `record.userId === session.user.id`.

### Tenant isolation
- All RAG queries filter by `userId` in the WHERE clause — pgvector search can't cross-leak.
- Supermemory `containerTags: [userId]` enforces isolation at the memory layer.
- Composio uses `userEmail` as the user identifier for connected accounts.
- R2 object keys prefix with `userId/` — deletion + listing scoped naturally.

### Secrets handling
- Server envs validated via zod and never imported in client bundles (t3-env enforces this).
- The Better Auth secret encrypts session cookies.

### Input validation
- Zod schemas at API boundaries (`messageSchema` in chat route, etc.).
- File type allowlist in `isValidFileType()` ([file-processing.ts:478-496](src/lib/file-processing.ts#L478-L496)).
- MIME/extension cross-check in `resolveFileType()` prevents extension-swap attacks.

### Console scrubbing
- `removeConsole` compiler option in production keeps `console.error` but strips `console.log` from the client bundle.

### Known gaps (be honest in interviews)
- **No rate limiting** on `/api/chat` despite Upstash Redis being in deps. `messageUsage` table exists but enforcement is not wired up.
- **No CSRF protection on cron endpoint** unless `CRON_SECRET` is set (optional).
- **No file-size cap before processing** — large uploads could OOM the embedding microservice. `serverActions.bodySizeLimit: "50mb"` is the only gate.
- **In-process MCP session cache** would leak across users if `sessionKey` were ever buggy (it isn't — keyed on `userId-chatId`).

---

## 22. Critical Design Decisions & Trade-offs

These are the topics most likely to come up. Be ready to defend each one.

### 22.1 Why a separate FastAPI AI microservice instead of doing everything in Node?

**Pros:**
- Python has first-class ML SDKs (especially for OCR, tokenizers, custom embedding models).
- Independent scaling — file processing is bursty.
- Long-running OCR jobs don't tie up Node's event loop.
- Easier to swap embedding models without redeploying the web app.

**Cons:**
- Extra network hop (~10-50ms even on warm).
- Extra service to operate, deploy, monitor.
- Source of truth split for type definitions (mitigated by `ai-microservice/types.ts`).

### 22.2 Why pgvector instead of a dedicated vector DB (Pinecone, Qdrant, Weaviate)?

**Pros:**
- One database to manage. ACID across vectors + relational data — joining `documentChunk` with `fileUpload` and `folder` is a single query.
- Cheap (no separate service cost).
- Cascade deletes work naturally when a user/file is removed.
- Neon supports it out of the box.

**Cons:**
- No HNSW/IVFFlat index currently → exact search is O(N) per user. Fine while corpora are small (10k chunks) but won't scale to 10M+. The fix is one CREATE INDEX statement; the design just hasn't needed it yet.
- pgvector lacks features of specialized DBs (hybrid search, re-ranking).

### 22.3 Why `streamText()` with one big tool registry instead of explicit agent chains (LangChain, agent graphs)?

**Pros:**
- Model decides what to call when — adapts to user intent without code change.
- `stepCountIs(10)` is the only safety net needed.
- Simpler mental model: "give the model these tools, it'll figure it out."
- Adding a new tool is one file, zero orchestration code.

**Cons:**
- Hard to debug a 10-step tool chain after the fact.
- Cost can vary wildly per request (1 step vs 10 steps).
- Token bloat — every tool's full schema is sent on every turn.

Mitigation: tool descriptions are tight; system prompt explicitly guides the model on which tool to use when.

### 22.4 Why DB as source of truth for chat history (instead of accepting client messages)?

**Pros:**
- Prevents replay / injection of fake assistant turns.
- Frontend optimism doesn't corrupt durable state.
- Reconciliation across browser tabs / devices is trivial.

**Cons:**
- Extra round-trip on every message (read messages from DB before streaming).
- More complex client-side optimistic UI (frontend has to write first, then call API).

### 22.5 Why MCP session cached per `(userId, chatId)` and not just `userId`?

**Pros:**
- Each chat session gets a clean tool router state.
- Avoids cross-chat tool leakage if Composio router has any context.

**Cons:**
- Per-chat connection overhead on first message.
- Doesn't survive process restarts (in-process Map only).

### 22.6 Why Composio over Nango / direct OAuth?

Composio gives you 120+ integrations via a single API key and unified tool format (MCP). Building 120 OAuth flows + 120 API wrappers in-house is months of work. The trade-off: vendor lock-in and external dependency risk.

(Nango is in package.json but unused — likely an early experiment.)

### 22.7 Why a custom signature-based dedup for assistant messages?

`stableStringify` sorts object keys deterministically → identical content always hashes to the same string. Compared against the last-saved assistant message. Prevents:
- Double-save when client reconnects mid-stream.
- Race between `onFinish` and a second request triggering the same response.

Trade-off: extra DB read per save. Cheap relative to model cost.

### 22.8 Why hourly TTL on personalized prompts (instead of generating on every page load)?

User context (file count, recent files) doesn't change minute-to-minute. Hourly is fresh enough. The lazy regen + cron pre-warm pattern means active users always get sub-100ms loads, and inactive users get up-to-date prompts via cron without paying generation cost on first visit.

---

## 23. Known Issues & Areas of Improvement

> Showing self-awareness here is good interview signal.

### Correctness
- **R2 cleanup is manual on cascading deletes.** Deleting a `user` cascades through DB but doesn't delete R2 objects. A periodic reconciler or a deletion queue is needed.
- **Embedding failures are swallowed in `uploadFile`** — the file row is created but no chunks exist. UI doesn't surface this; user sees the file "uploaded" but it's not searchable.
- **No retry on title generation failure** — chat stays "New Chat" forever if the microservice was down at that moment.

### Performance
- **No vector index** — exact scan is fine at small scale but should be `CREATE INDEX ... USING hnsw (embedding vector_cosine_ops)` before going to production scale.
- **Sequential per-row LLM call in CSV processing** — `convertRowToSentence` is awaited in a `for` loop. Should be batched.
- **In-process MCP session cache** doesn't survive a process restart — first message after deploy is slow. Could move to Upstash.
- **`document_chunk.embedding` returned in some queries** — large rows over the wire. The `getRootFilesForSearch` pattern (select only essentials) should be applied more broadly.

### Reliability
- **No rate limiting on `/api/chat`** despite Upstash being installed.
- **Quota enforcement (`messageUsage`) is not wired up** — schema exists but no middleware checks it.
- **No automated tests.** README acknowledges this; it's the single biggest "production-readiness" gap.

### Observability
- **No correlation IDs** linking middleware log → route handler log → microservice log.
- **Cost telemetry exists per-message** (tokenlens in deps) but isn't surfaced in a dashboard.

### Naming / consistency
- `src/lib/minio.ts` should be `r2.ts` and `uploadToMinIO` should be `uploadToR2`. Confusing in code review.
- `src/lib/compostio.ts` is misspelled (`compostio` vs `composio`).
- R2 path conventions differ between `files.ts` (`${userId}/files/${generateId()}/${name}`) and `composio-file-processor.ts` (`${userId}/files/${Date.now()}-${name}`).
- Package name in `package.json` is `salesorbit`, app brand is `Salesient`. R2 bucket default is `salesorbit`. Pick one.

### Schema gaps
- `messageUsage` table is unused.
- `subscription` table has Dodo Payments fields but no webhook handler.
- No `team` / `workspace` table → multi-tenancy limited to per-user.

---

## 24. Interview Cheat-Sheet — Likely Questions

### Q: Walk me through what happens when a user sends a chat message.
A: 8 steps end-to-end — see §9.1. Hit the highlights: (1) middleware auth log, (2) route handler verifies session + chat ownership, (3) DB is source of truth for messages, (4) MCP session is cached per `(userId, chatId)`, (5) system prompt is layered (timestamp + user context + base prompt), (6) `streamText` with up to 10 tool steps + 10 tools + dynamic MCP tools, (7) stream returned as SSE, (8) `onFinish` persists assistant with signature-dedup.

### Q: How does your RAG pipeline work?
A: At ingestion: file → R2 → format-specific text extraction (Gemini OCR for PDFs/images via microservice, mammoth for DOCX, xlsx→csv→NL-sentences for spreadsheets) → recursive chunking (1024 chars, 256 overlap) → batch embeddings (Gemini 768-D via microservice) → bulk insert into `document_chunk` with pgvector. At query: query embedding → pgvector cosine search with `<=>` operator → filter by similarity threshold (0.5 global, 0.4 local) → wrap chunks in instruction-augmented context block → inject into model context.

### Q: Why pgvector instead of Pinecone?
A: See §22.2. Single source of truth, cascade deletes, ACID joins across tabular + vector data, cheaper. Scales to ~1M chunks per user easily once we add an HNSW index. We'd reach for Pinecone when we need hybrid search, fine-tuned re-rankers, or sub-100ms latency at 100M+ vectors.

### Q: How do you handle file uploads from cloud storage (e.g., user's Google Drive)?
A: Two-tool workflow. Model calls `SMART_FILE_READER({integration, fileId, fileName})` which returns a workflow plan (download action name + params). Model then calls the Composio download action via MCP (e.g., `GOOGLEDRIVE_DOWNLOAD_FILE`), then passes that response to `COMPOSIO_FILE_PROCESSOR` which extracts the buffer from any of 10+ possible shapes (Buffer, base64 string, nested `data`/`content`/`bytes`/`s3url` fields), uploads to R2, runs the same ingestion pipeline as web uploads (extract → chunk → embed → DB).

### Q: How is the system multi-tenant?
A: User scoping is enforced at every layer: (1) Better Auth session check on every endpoint, (2) `userId` in every DB filter (`WHERE user_id = ?`), (3) Supermemory `containerTags: [userId]`, (4) R2 object key prefix `${userId}/files/`, (5) Composio identifies users by email. No cross-user leakage is possible without an auth bypass.

### Q: What happens if the AI microservice goes down?
A: Title generation silently fails (chat stays "New Chat"). Embeddings fail → file uploads succeed but aren't searchable (best-effort try/catch in `uploadFile`). PDF/image OCR fails → upload throws and is rejected by the API route. Chat itself doesn't depend on the microservice — it talks to Gemini directly via `@ai-sdk/google`, so chat continues working.

### Q: How do you prevent runaway tool-call loops?
A: `stopWhen: stepCountIs(10)` in the `streamText` call. After 10 reasoning/tool steps, the model is forced to respond. Combined with `maxOutputTokens: 4096`, worst-case cost per turn is bounded.

### Q: How do you keep the chat UI responsive while the model is streaming?
A: SSE from `/api/chat`, decoded by `useStreamingChat` hook. Three reactive state slots: `streamingContent` (text), `streamingToolCalls` (with `running`/`result` state), `streamingReasoning`. UI re-renders incrementally as deltas arrive. Tool calls are rendered with the AI Elements `<Tool>` component which shows args while running and result when done. In production, tool calls are hidden from end users (system prompt instructs the model to "hide reasoning/tools").

### Q: How is user context personalized?
A: Two layers. (1) The user's `customSystemPrompt` from `userPreferences.systemPreferences` is injected at the top of the system prompt as PRIMARY CONTEXT. (2) Supermemory accumulates insights across all chats — the base prompt mandates `search_memories` first and `add_memory` at the end of every response. Result: the assistant gets sharper over time without any explicit "learn this" UI.

### Q: How would you scale this to 10× users tomorrow?
A: Bottlenecks in order:
1. **pgvector exact scan** → add HNSW index (5-min fix).
2. **In-process caches** → move MCP sessions and performance caches to Upstash Redis (a day's work).
3. **AI microservice** → horizontal autoscale on Cloud Run / Fly, since it's stateless.
4. **Neon connection pool** → already serverless-friendly, but watch the `<=>` query times under load.
5. **Composio MCP session creation** → batch / pre-warm for active users.
6. **No rate limiting** → add per-user message rate limits using `messageUsage` table + Upstash for atomic counters.

### Q: Walk me through the security model.
A: See §21. Highlights: zod-validated envs, server/client env separation, Better Auth CSRF, ownership checks on every mutation, per-user scoping in all queries, Supermemory tenant tags, MIME-vs-extension reconciliation to prevent file-type spoofing. Known gaps: no rate limiting yet, no quota enforcement, manual R2 cleanup on cascade deletes.

### Q: What's the hardest bug you've shipped a fix for?
A: (Pick a concrete one based on your branch history — the user's current branch is `fix/title-not-updating` and the latest commits include refactors to message processing. Use those as examples.)

### Q: What would you do differently if you started over?
A: (1) Single naming convention — kill the `minio`/`compostio` legacy names. (2) Test-first — Vitest + Playwright from day one. (3) Move MCP session cache to Redis from the start. (4) HNSW index on `documentChunk.embedding` from day one. (5) Wire up `messageUsage` enforcement immediately to avoid abuse. (6) Use OpenAPI/typed contracts between Next.js and the microservice instead of hand-maintained TypeScript types.

---

**Last updated:** based on code state as of branch `main` (HEAD: `c6de5a3`).
**File ownership:** Engineering — keep this file in sync as architecture evolves.
