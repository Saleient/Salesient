# SalesOrbit – Technical Documentation

> Internal engineering reference for the `salesorbit-web` repository implementation–level detail.

## 1. Purpose

SalesOrbit is a production-ready AI sales assistant platform combining: (1) structured data (accounts, documents, integrations), (2) unstructured knowledge (uploaded files, scraped web content, cloud storage), and (3) AI assistance (chat with RAG pipeline, memory layer, tool orchestration) to accelerate B2B sales workflows (research, objection handling, content generation, CRM integration).

## 2. High-Level Architecture

| Layer                | Technologies                                                                              | Responsibility                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| UI / Client          | Next.js 16 (App Router), React 19, Tailwind CSS 4, Radix UI, shadcn/ui components, Motion | Interactive product & marketing surfaces; chat; integrations dashboard; document management |
| Server               | Next.js Route Handlers / Server Actions, Node.js runtime                                  | Auth, chat streaming, file operations, integration orchestration                            |
| Auth                 | Better Auth + Drizzle adapter + Google OAuth + Magic Link                                 | User/session/account lifecycle with multiple auth strategies                                |
| Data                 | Neon PostgreSQL (Drizzle ORM)                                                             | Relational persistence; embeddings; usage tracking; complete schema                         |
| Cache                | Upstash Redis + in‑memory performance cache                                               | Session caching, user preferences, computed data                                            |
| AI                   | Vercel AI SDK (Gemini 2.5 Flash primary, Mistral, OpenAI, Groq, Cerebras, XAI support)    | Multi-provider chat completion, reasoning, tool orchestration                               |
| Tools & Integrations | Composio (120+ integrations), MCP (Model Context Protocol), Firecrawl, Firesearch         | CRM, HRMS, cloud storage, email integrations via unified OAuth                              |
| Storage              | Cloudflare R2 (S3-compatible)                                                             | Binary object storage for uploaded & synced documents (production)                          |
| Vector / Embeddings  | pgvector extension + Gemini Embedding 001 (768 dimensions)                                | Semantic search + RAG context retrieval (production)                                        |
| Memory Layer         | Supermemory (OSS) with SQLite backend                                                     | Persistent conversational & user preference memory (production)                             |
| File Processing      | Mammoth (DOCX), pdf-lib, papaparse (CSV), xlsx, jszip                                     | Multi-format document parsing & text extraction                                             |
| Observability        | Axiom logging, PostHog analytics & session replay                                         | Application monitoring, user behavior tracking, error tracking                              |
| Email                | Resend + React Email                                                                      | Transactional email delivery with templating                                                |

## 3. Runtime Flow (User Journey)

### 3.1 Authentication Flow

1. User hits `/login` (public route group `(auth)`).
2. Initiates Google OAuth through Better Auth client (`signIn.social`).
3. Better Auth exchanges code → creates/updates `user`, `account`, `session` rows.
4. Redirect to `/dashboard` inside `(product)` group (protected surface – server actions validate session).

### 3.2 Chat Flow (Current Implemented Path)

```
UI ChatInput -> POST /api/chat -> auth.session validation
		-> (create or validate chat record) -> insert user message
		-> streamText(model=gemini-2.5-flash, tools={firecrawl})
		-> SSE stream (UIMessageStream) -> client incremental render
		-> (async) first message => title generation (gemini-2.5-flash-lite)
		-> token usage + completion time update (planned expansion)
```

### 3.3 Document Management (Production)

```
User -> /dashboard/documents
		-> create folders (projects) or upload root files
		-> uploadFile() -> validate file type (PDF, DOCX, PPTX, XLSX, CSV, TXT, MD)
		-> upload to R2 (userId/files/uniqueId/filename)
		-> processFile() -> extract text via format-specific parsers
		-> chunkText() -> recursive splitting (1024 chars, 256 overlap)
		-> generateEmbeddings() -> Gemini batch embedding (768D)
		-> store in document_chunk table with pgvector
		-> searchable via LOCAL_RAG_SEARCH & GLOBAL_RAG_SEARCH tools
```

Server actions: `uploadFile`, `listFiles`, `deleteFile`, `moveFile`, `createFolder`, `listFolders`, `deleteFolder`, `downloadFile`, `getDownloadURL` (all implemented in `src/queries/files.ts`).

### 3.4 Integrations (Composio) – Production

Flow implemented:

```
User -> /dashboard/integrations -> browse 120+ integrations (CRM, HRMS, cloud storage, email)
		-> initiate OAuth via Composio -> connectionId + entityId generated
		-> integration enabled -> MCP tools dynamically loaded for chat
		-> user mentions cloud file in chat -> SMART_FILE_READER guides download workflow
		-> integration-specific download action (e.g., ONEDRIVE_DOWNLOAD_FILE)
		-> COMPOSIO_FILE_PROCESSOR -> R2 upload -> text extraction -> embedding -> RAG indexing
		-> file content available for semantic search in chat context
```

Supported integrations: Google Drive, OneDrive, Dropbox, Box, S3, SharePoint, Notion, Salesforce, HubSpot, Pipedrive, Gmail, Outlook, Mailchimp, Slack, and 100+ more via Composio.

### 3.5 RAG Query Flow (Production)

```
User message with attachments or cloud file reference
		-> LOCAL_RAG_SEARCH (attached files) or integration download
		-> generateEmbedding(query) -> Gemini 768D vector
		-> pgvector similarity search: document_chunk.embedding <=> query_vector
		-> retrieve top-K chunks (configurable, default 5-10)
		-> filter by minSimilarity (0.4 for local, 0.5 for global)
		-> inject into system prompt with metadata (source file, project, similarity score)
		-> AI completion with augmented context
		-> response includes citations and source references
		-> add_memory() auto-called to persist key insights
```

RAG tools: `GLOBAL_RAG_SEARCH` (user's full document corpus), `LOCAL_RAG_SEARCH` (specific files/projects), `SMART_FILE_READER` (integration file routing), `COMPOSIO_FILE_PROCESSOR` (universal file ingestion).

## 4. Repository Structure (Functional Breakdown)

```
drizzle/                # SQL migrations + meta journal
src/
	ai/                   # AI provider setup + Firecrawl tool
	app/                  # Next.js route groups
		(auth)/login        # OAuth login surface
		(default)/          # Public marketing pages (home, pricing, faq)
		(product)/          # Authenticated product UI (dashboard, documents, integrations, settings)
		api/auth            # Better Auth unified handler
		api/chat            # Streaming chat endpoint
	components/
		ai-elements/        # Fine-grained AI rendering primitives (messages, reasoning, artifacts, tools)
		sections/home       # Landing page sections
		sections/product/chat # Chat UI composition
		ui/                 # shadcn/radix primitives
		motion-primitives/  # Animation helpers (carousel, text-loop)
	db/                   # Drizzle schema + connection
	env/                  # Zod-based env validation
	hooks/                # Misc React hooks (e.g., mobile detection)
	lib/                  # Auth, performance cache, utilities (future: nango, r2, embeddings)
	queries/              # Server actions / DB access (chat implemented)
```

## 5. Database Schema (Drizzle / Postgres)

### 5.1 Core Entities

| Table        | Purpose                      | Key Columns                           |
| ------------ | ---------------------------- | ------------------------------------- |
| user         | Primary identity             | id, email(unique), emailVerified      |
| session      | Auth session tracking        | userId(FK), token(unique), expiresAt  |
| account      | OAuth provider linkage       | providerId, accountId, tokens, userId |
| verification | Ephemeral verification codes | identifier, value, expiresAt          |

### 5.2 Chat System

| Table   | Purpose                                | Notes                                                   |
| ------- | -------------------------------------- | ------------------------------------------------------- |
| chat    | Conversation metadata                  | title auto-generated; attachments JSON                  |
| message | Granular message parts                 | role (user, assistant, tool); parts JSON; token metrics |
| stream  | Reserved for active streaming timeline | Minimal structure currently                             |

### 5.3 Billing & Usage

| Table        | Purpose                          | Notes                                                      |
| ------------ | -------------------------------- | ---------------------------------------------------------- |
| subscription | External payment (Dodo) snapshot | Period windows, cancellation fields, metadata JSON-as-text |
| messageUsage | Daily message quota tracking     | resetAt for scheduled resets (logic pending)               |

### 5.4 Knowledge & Files

| Table           | Purpose                                 | Notes                                                                                                                  |
| --------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| folder          | Logical grouping (projects)             | Cascade deletes to fileUpload; user-owned hierarchical organization                                                    |
| fileUpload      | File metadata & storage reference       | R2 object key (filePath), extracted text cache, integration metadata (logo, source), cascade deletes documentChunk     |
| documentChunk   | Semantic search units                   | pgvector(768) embeddings, content chunks (1024 chars), metadata (source, position), indexed for fast cosine similarity |
| userPreferences | User-specific settings & cached prompts | Custom system prompt, personalized quick prompts, generated based on user context (fileCount, chatCount, etc.)         |

### 5.5 Integrations

Integration state managed via Composio platform (external to database). Schema extensible for future integration metadata caching if needed. Current approach: real-time queries to Composio API for auth configs, connection status, and entity bindings.

### 5.6 Referential & Deletion Rules

- `message.chatId` ON DELETE CASCADE → cleans messages when chat removed.
- `fileUpload.folderId` ON DELETE CASCADE → cleans files when folder removed.
- Integrations & knowledge base follow cascade to user for account purge compliance.

## 6. Chat Subsystem (Detailed)

### 6.1 Server Actions (`src/queries/chat.ts`)

Implemented operations:

- `createChat(userId)` – inserts new chat row; `generateId` default.
- `addMessageToChat(chatId, role, parts, attachments)` – raw insertion.
- `getMessagesByChatId(chatId)` – chronological ascending order.
- `updateMessagePartsAndUsage(messageId, parts?, {token metrics})` – patch for streaming completion metrics.
- `generateTitleFromUserMessage(message)` → Gemini Lite model call.
- `updateChatTitle(chatId, title)` – sets finalized title.

### 6.2 API Route (`/api/chat`)

Responsibilities:

1. Validate session.
2. Ensure chat existence/ownership.
3. Normalize last user message parts.
4. Spawn UI stream via `createUIMessageStream`.
5. Use `streamText` with Firecrawl tool available; stop condition `stepCountIs(5)` truncates runaway tool loops.
6. Asynchronous title generation for first message.
7. Return streaming response compatible with client component architecture.

### 6.3 Message Parts Format

`parts: JSON[]` – Each part may represent:

- `{ type: "text", text: string }`
- `{ type: "tool-call", tool: string, input: {...} }`
- `{ type: "tool-result", tool: string, output: {...} }`
  (Future) image, citation, code artifact, plan nodes.

### 6.4 Token Accounting (Production)

Fields: `inputTokens`, `outputTokens`, `totalTokens`, `completionTime` populated in `message` table. Token usage tracked via AI SDK callbacks in `onFinish` hook. Cost calculation integrated via `tokenlens` library for multiple providers. UI displays token usage, cost estimates, and reasoning tokens (when available) via Context components.

## 7. AI Layer

### 7.1 Providers

- Google Gemini 2.5 Flash – primary for completions & tool orchestration.
- Google Gemini 2.5 Flash Lite – cost-optimized title generation.
- Mistral (configured, not actively invoked yet).

### 7.2 Tooling

`Firecrawl` (web retrieval): Input schema `url`, optional `include_summary` (currently not used by executor). Returns standardized markdown, metadata, timing.

### 7.3 System Prompt Constraints

Sales-only domain guardrails; deflection for non-sales queries; enforced styling guidelines (concise, structured). Future: dynamic augmentation with retrieved RAG snippets + structured memory.

### 7.4 Current Capabilities

- Tool result persistence in message parts (tool-call, tool-result).
- Cost telemetry via tokenlens (per-message cost tracking).
- Multi-provider support configured (Gemini, Mistral, OpenAI, Groq, Cerebras, XAI).
- Gemini thinking budget (8192 tokens) for extended reasoning.
- MCP protocol integration for dynamic tool loading.
- Memory persistence via Supermemory (search_memories, add_memory).

### 7.5 Future Enhancements

- Automatic provider fallback chain with retry logic.
- Response latency SLAs and auto-switching.
- Enhanced cost optimization (model routing by complexity).
- Expanded tool library (calendar, email drafting, CRM write operations).

## 8. UI Composition

### 8.1 Route Groups

| Group       | Purpose               | Characteristics                                                                      |
| ----------- | --------------------- | ------------------------------------------------------------------------------------ |
| `(auth)`    | Login                 | Minimal shell; no marketing artifacts                                                |
| `(default)` | Public marketing      | Navbar + Footer + Lenis smooth scroll                                                |
| `(product)` | Authenticated product | Providers (React Query) wrapper; sidebar layout; chat/documents/integrations modules |

### 8.2 Component Domains

- `ai-elements/` – granular render logic for streaming parts (message, reasoning, code, sources, tasks, suggestions, etc.).
- `sections/product/chat/` – chat shell orchestration (input, attachments, search panel).
- `ui/` – foundational primitives (Button, Dialog, Select, etc.) composed from Radix + Tailwind.

### 8.3 Styling Strategy

- Tailwind utility layer + variant abstraction via CVA.
- `tailwind-merge` + `clsx` for deterministic class merging.
- Motion primitives for non-blocking UI transitions.

## 9. Environment Variables (Validated via `@t3-oss/env-nextjs`)

Server-only (required):

```
DATABASE_URL                    # Neon PostgreSQL connection string
BETTER_AUTH_SECRET              # Session encryption key
GOOGLE_CLIENT_ID                # OAuth client credentials
GOOGLE_CLIENT_SECRET
GOOGLE_API_KEY                  # Gemini AI & embeddings
MISTRAL_API_KEY                 # Mistral AI models
FIRECRAWL_API_KEY               # Web scraping service
R2_ACCOUNT_ID                   # Cloudflare R2 storage
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET                       # Default: "salesorbit"
COMPOSIO_API_KEY                # Integration platform
MEM0_DB_PATH                    # Supermemory SQLite path (default: /tmp/memory.db)
EMBEDDINGS_DIMENSION            # Vector dimensions (default: 768)
SUPERMEMORY_API_KEY             # Memory layer service
RESEND_API_KEY                  # Email delivery
UPSTASH_REDIS_REST_URL          # Optional: Redis caching
UPSTASH_REDIS_REST_TOKEN
```

Client-exposed (public):

```
NEXT_PUBLIC_SITE_URL            # Optional: Marketing site URL
NEXT_PUBLIC_APP_URL             # Optional: Application URL
NEXT_PUBLIC_POSTHOG_KEY         # Analytics & session replay
NEXT_PUBLIC_POSTHOG_HOST        # Default: https://us.i.posthog.com
```

## 10. Performance & Caching

### 10.1 React Query Configuration

- `staleTime = 5m`, `gcTime = 10m`, disabled refetch on focus to reduce churn.
- Mutation-driven cache invalidation for future project/file operations.

### 10.2 In-Memory Performance Cache

`performance-cache.ts` outlines eviction & memory limits (future integration points: chunk caching, throttled expensive computations).

### 10.3 Redis (Upstash)

Currently reserved for broader caching strategy (session acceleration, RAG query chunk caching, integration polling de-duplication – all planned).

### 10.4 Streaming UX

AI responses use SSE with incremental part hydration to minimize perceived latency; avoids blocking full message availability on tool completion.

## 11. Implementation Status & Roadmap

### ✅ Production Features (Complete)

| Feature                  | Status      | Implementation                                                                            |
| ------------------------ | ----------- | ----------------------------------------------------------------------------------------- |
| R2 file storage          | ✅ Complete | `lib/minio.ts` with full CRUD operations (upload, download, delete, list, presigned URLs) |
| File CRUD server actions | ✅ Complete | `queries/files.ts` with complete file & folder management                                 |
| Embedding generation     | ✅ Complete | `lib/embeddings.ts` using Gemini Embedding 001 (768D), batch processing                   |
| Vector similarity search | ✅ Complete | pgvector extension with cosine distance, indexed searches                                 |
| RAG pipeline             | ✅ Complete | Global & local RAG tools, chunk-based retrieval, metadata filtering                       |
| Memory layer             | ✅ Complete | Supermemory integration with search & add operations, user-scoped memory                  |
| Integration backend      | ✅ Complete | Composio SDK with 120+ integrations, MCP protocol, OAuth flows                            |
| Chat system              | ✅ Complete | Streaming responses, tool calls, reasoning display, multi-turn context                    |
| File processing          | ✅ Complete | Multi-format support (PDF, DOCX, PPTX, XLSX, CSV, TXT, MD), text extraction, chunking     |
| Token usage tracking     | ✅ Complete | Accurate token counts, cost calculation, UI display                                       |
| Authentication           | ✅ Complete | Better Auth with Google OAuth + Magic Link                                                |
| Document management UI   | ✅ Complete | Folders (projects), file upload/download, search, organization                            |
| Observability            | ✅ Complete | Axiom logging, PostHog analytics                                                          |
| Personalized prompts     | ✅ Complete | Context-aware prompt generation based on user activity                                    |
| Smart file reader        | ✅ Complete | Integration-aware file download workflows for cloud storage                               |

### 🚧 Planned Features & Improvements

| Feature                   | Priority | Required Work                                                        | Notes                                       |
| ------------------------- | -------- | -------------------------------------------------------------------- | ------------------------------------------- |
| Subscription & billing    | High     | Dodo webhook integration, quota enforcement middleware               | Schema exists, webhook handler pending      |
| Usage quota enforcement   | High     | Pre-chat quota check, rate limiting, tier-based restrictions         | messageUsage table present                  |
| Team collaboration        | Medium   | Team schema, member management, shared folders, permissions          | Multi-tenant architecture foundation needed |
| Admin dashboard           | Medium   | User management, analytics aggregation, system health monitoring     | Leverage existing telemetry                 |
| Advanced analytics        | Medium   | Charts library integration, usage trends, cost tracking              | Data foundation complete                    |
| Email integration (write) | Medium   | Gmail/Outlook send actions, template system, draft management        | Read-only currently via Composio            |
| Calendar integration      | Medium   | Event creation, meeting scheduling, availability checking            | Foundation via Composio                     |
| Knowledge base curation   | Low      | User-managed KB entries, tagging system, priority weighting          | Could enhance RAG quality                   |
| Multi-language support    | Low      | i18n framework, translation management                               | English-only currently                      |
| Mobile app                | Future   | React Native or PWA                                                  | Web-first strategy                          |
| Advanced CRM write ops    | Future   | Deal creation, contact updates, pipeline management via integrations | Read/search currently supported             |
| Automated testing         | High     | Vitest unit tests, Playwright e2e tests, CI/CD integration           | No tests currently                          |

## 12. Charts & Analytics (Design Placeholder)

Planned metrics & visualizations:
| Chart | Data Source | Purpose |
|-------|-------------|---------|
| Message Volume Over Time | `messageUsage` aggregated by day | Quota monitoring, scaling triggers |
| Integration Sync Status | Nango sync logs (planned) | Identify failing connectors |
| Embedding Coverage % | `fileUpload` where embedding IS NOT NULL / total files | Track ingestion completeness |
| Response Latency Distribution | `message.completionTime` | Model performance tuning |
| Top Retrieved Documents (RAG) | future retrieval logs | Content effectiveness |

Implementation outline: future `analytics.ts` query module + `<AnalyticsDashboard/>` with @xyflow/react for flow diagrams and a chart library (consider lightweight D3 subset or Recharts).

## 13. Package Inventory & Rationale

### Core Framework

| Package                      | Version | Role             | Reason                                      |
| ---------------------------- | ------- | ---------------- | ------------------------------------------- |
| `next`                       | 16.0.1  | Framework        | App Router, server actions, streaming       |
| `react` / `react-dom`        | 19.2.0  | UI               | Latest concurrent features                  |
| `drizzle-orm`, `drizzle-kit` | 0.44.7  | ORM + migrations | Type safety, pgvector support, lean runtime |
| `@neondatabase/serverless`   | 1.0.2   | DB transport     | Serverless Postgres over HTTP               |
| `better-auth`                | 1.3.34  | Auth             | Modern TS-first, multi-provider OAuth       |

### AI & ML Stack

| Package              | Version | Role                   | Reason                              |
| -------------------- | ------- | ---------------------- | ----------------------------------- |
| `ai`                 | 5.0.87  | AI orchestration       | Unified streaming, tools, providers |
| `@ai-sdk/google`     | 2.0.33  | Gemini integration     | Primary model + embeddings          |
| `@ai-sdk/mistral`    | 2.0.24  | Mistral models         | Alternative provider                |
| `@ai-sdk/openai`     | 2.0.64  | OpenAI models          | Additional provider option          |
| `@ai-sdk/mcp`        | 0.0.8   | Model Context Protocol | Dynamic tool loading                |
| `@supermemory/tools` | 1.3.3   | Memory layer           | Persistent conversational memory    |
| `tokenlens`          | 1.3.1   | Cost calculation       | Multi-provider token cost tracking  |

### Integrations & Tools

| Package                              | Version | Role                 | Reason                       |
| ------------------------------------ | ------- | -------------------- | ---------------------------- |
| `@composio/core`, `@composio/vercel` | 0.2.x   | Integration platform | 120+ app integrations, OAuth |
| `@modelcontextprotocol/sdk`          | 1.22.0  | MCP protocol         | Dynamic tool discovery       |
| `@mendable/firecrawl-js`             | 4.5.0   | Web scraping         | Structured page extraction   |

### Storage & File Processing

| Package              | Version | Role              | Reason                        |
| -------------------- | ------- | ----------------- | ----------------------------- |
| `@aws-sdk/client-s3` | 3.937.0 | R2 storage client | Cloudflare R2 operations      |
| `mammoth`            | 1.11.0  | DOCX parsing      | Word document text extraction |
| `pdf-lib`            | 1.17.1  | PDF processing    | PDF text extraction           |
| `xlsx`               | 0.18.5  | Excel parsing     | Spreadsheet processing        |
| `papaparse`          | 5.5.3   | CSV parsing       | CSV file processing           |
| `jszip`              | 3.10.1  | Archive handling  | ZIP file support              |

### UI & Styling

| Package                    | Version  | Role                  | Reason                                 |
| -------------------------- | -------- | --------------------- | -------------------------------------- |
| `tailwindcss`              | 4.x      | CSS framework         | Utility-first styling                  |
| `@radix-ui/*`              | Various  | Accessible primitives | Headless UI components                 |
| `class-variance-authority` | 0.7.1    | Variant management    | Type-safe component variants           |
| `motion`                   | 12.23.24 | Animation             | Performant declarative animations      |
| `lucide-react`             | 0.552.0  | Icons                 | Consistent icon system                 |
| `shiki`                    | 3.15.0   | Code highlighting     | Syntax highlighting for code artifacts |
| `sonner`                   | 2.0.7    | Toast notifications   | User feedback system                   |

### Data & State

| Package                 | Version | Role              | Reason                                 |
| ----------------------- | ------- | ----------------- | -------------------------------------- |
| `@tanstack/react-query` | 5.90.7  | Server state      | Caching, mutations, optimistic updates |
| `@t3-oss/env-nextjs`    | 0.13.8  | Env validation    | Type-safe environment variables        |
| `zod`                   | 4.1.12  | Schema validation | Runtime type checking                  |
| `@upstash/redis`        | 1.35.6  | Caching           | Redis client for session cache         |

### Observability & Analytics

| Package                             | Version | Role      | Reason                             |
| ----------------------------------- | ------- | --------- | ---------------------------------- |
| `@axiomhq/nextjs`, `@axiomhq/react` | 0.1.6   | Logging   | Structured application logs        |
| `posthog-js`, `posthog-node`        | 1.297.2 | Analytics | Product analytics & session replay |

### Dev Tools

| Package                 | Version | Role             | Reason                        |
| ----------------------- | ------- | ---------------- | ----------------------------- |
| `@biomejs/biome`        | 2.3.7   | Lint + format    | Fast Rust-based tooling       |
| `ultracite`             | 6.3.5   | Enhanced linting | Additional code quality rules |
| `husky` + `lint-staged` | Latest  | Git hooks        | Pre-commit quality checks     |
| `tsx`                   | 4.20.6  | TS executor      | Fast TypeScript execution     |

## 14. Scripts

```
dev        # next dev
build      # next build
start      # next start
lint       # biome check
format     # biome format --write
db:gen     # drizzle-kit generate (create migration from schema diff)
db:push    # drizzle-kit push (apply schema to database)
prepare    # husky install hooks
```

## 15. Quality Gates & Code Standards

### Current Enforcement

- **TypeScript**: Strict mode enabled, path aliases (`@/*`), comprehensive type coverage.
- **Linting**: Biome + Ultracite with custom rules from `.github/copilot-instructions.md` (accessibility, React best practices, code complexity).
- **Formatting**: Biome auto-format on save, pre-commit hooks via Husky + lint-staged.
- **Git Hooks**: Pre-commit format validation, automated code quality checks.
- **Environment Validation**: Runtime checks via `@t3-oss/env-nextjs` with Zod schemas.

### Testing (To Be Implemented)

- **Unit Tests**: Vitest for utilities, hooks, server actions.
- **Integration Tests**: API route testing, database operations.
- **E2E Tests**: Playwright for critical user flows (auth, chat, file upload, integrations).
- **Coverage Target**: >80% for business logic, >60% overall.

### Security Practices

- Environment variables never exposed to client (strict separation).
- CSRF protection via Better Auth.
- File type validation before processing.
- Input sanitization via Zod schemas.
- Rate limiting ready (Redis infrastructure present).

## 16. Extension Points & Enhancement Opportunities

### High-Priority Improvements

#### Auth & Access Control

- [ ] Team workspace model (shared chats, folders, integrations).
- [ ] Role-based permissions (owner, admin, member, viewer).
- [ ] Session revocation API endpoint.
- [ ] IP allowlisting for enterprise customers.

#### Billing & Monetization

- [ ] Dodo webhook handler (`/api/webhooks/dodo`) for subscription events.
- [ ] Usage quota middleware in chat route (enforce tier limits).
- [ ] Billing dashboard (current plan, usage metrics, upgrade flow).
- [ ] Grace period handling for expired subscriptions.

#### Testing & Reliability

- [ ] Vitest setup for unit tests (utilities, hooks, server actions).
- [ ] Playwright E2E tests (auth flow, chat, file upload, integrations).
- [ ] CI/CD pipeline (GitHub Actions) with test gates.
- [ ] Error boundary improvements with fallback UI.

### Medium-Priority Features

#### Advanced RAG

- [ ] Hybrid search (keyword + semantic) for better recall.
- [ ] Re-ranking models for retrieval quality.
- [ ] Citation extraction from source documents.
- [ ] Retrieval analytics (track which documents are most useful).

#### Integration Enhancements

- [ ] Background sync scheduler (cron job for cloud storage).
- [ ] Webhook listeners for real-time integration updates.
- [ ] Integration health monitoring dashboard.
- [ ] Bulk file import from integrations.

#### Observability & Monitoring

- [ ] Correlation IDs across requests (trace chat → DB → AI → response).
- [ ] Performance monitoring (p95 latency, slow query detection).
- [ ] Error aggregation and alerting.
- [ ] Cost tracking dashboard (AI usage by user/chat).

#### Analytics & Insights

- [ ] Usage charts (messages over time, popular integrations).
- [ ] Embedding coverage metrics (% of files indexed).
- [ ] User engagement analytics (session duration, feature usage).
- [ ] Admin dashboard with system health indicators.

### Future Exploration

#### Advanced AI Features

- [ ] Multi-agent workflows (research → draft → review).
- [ ] Voice input/output for accessibility.
- [ ] Image analysis (screenshots, diagrams).
- [ ] Document generation (proposals, contracts from templates).

#### Platform Expansion

- [ ] Public API for third-party integrations.
- [ ] Webhook system for custom workflows.
- [ ] White-label options for enterprise.
- [ ] Mobile app (React Native or PWA).

#### Enterprise Features

- [ ] SSO (SAML, OIDC).
- [ ] Audit logging (compliance requirements).
- [ ] Data residency options.
- [ ] Custom model fine-tuning.

## 17. Proposed Additional Schemas (Planned)

### 17.1 Conversation Memory

```
conversation_memory (
	id text PRIMARY KEY,
	user_id text REFERENCES user(id) ON DELETE CASCADE,
	chat_id text REFERENCES chat(id) ON DELETE CASCADE NULL,
	memory_type text,             -- preference | summary | fact
	content text,                 -- raw textual memory
	embedding json,               -- vector embedding for semantic recall
	created_at timestamp DEFAULT now()
)
```

### 17.2 Retrieval Log

```
retrieval_log (
	id text PRIMARY KEY,
	chat_id text REFERENCES chat(id) ON DELETE CASCADE,
	message_id text REFERENCES message(id) ON DELETE CASCADE,
	file_id text REFERENCES file_upload(id),
	score real,                   -- similarity score
	created_at timestamp DEFAULT now()
)
```

## 18. Data Integrity & Edge Cases

| Scenario                               | Handling / Gaps                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Chat deletion mid-stream               | Cascade removes messages; client should detect 404 on subsequent fetch (not yet implemented).           |
| Duplicate OAuth account link           | `account.accountId + providerId` uniqueness implied; ensure composite unique index in future migration. |
| Missing embedding during RAG           | Fallback to metadata-only or skip augmentation; needs guard in retrieval layer.                         |
| Large file upload (> configured limit) | Enforce size limit pre-R2; chunking strategy required.                                                  |
| Tool failure (Firecrawl)               | Returns error object; message part should reflect graceful degradation.                                 |
| Token metrics unavailable              | Persist null; UI hides usage stats. Future periodic backfill possible.                                  |

## 19. Deployment Checklist

1. All required env vars set.
2. Database schema pushed (`pnpm db:push`).
3. Optional: run migration snapshot verification.
4. Build succeeds (`pnpm build`).
5. Auth Google redirect URIs updated for production domain.
6. CORS / headers (if custom) validated for SSE continuity.

## 20. Troubleshooting Matrix

| Symptom                          | Likely Cause                              | Resolution                                                   |
| -------------------------------- | ----------------------------------------- | ------------------------------------------------------------ |
| 401 on `/api/chat`               | Missing session                           | Re-login; inspect auth cookies; verify `BETTER_AUTH_SECRET`. |
| Chat title remains default       | Title generation promise rejected         | Check Gemini Lite key; add retry/backoff.                    |
| Integrations page empty          | Absent `lib/nango.ts` implementation      | Implement Nango connector; set env keys.                     |
| Files not appearing after upload | File server actions not implemented       | Finish R2 + queries/files pipeline.                          |
| High memory usage                | Unbounded cache growth                    | Implement eviction thresholds in performance cache.          |
| AI not streaming                 | Network/SSE blocked or provider key issue | Inspect browser network logs; validate `GOOGLE_API_KEY`.     |

## 21. Licensing & Ownership

Proprietary – SalesOrbit. All rights reserved. Internal use only.

## 22. Versioning

- Current app version: `0.1.0` (pre-RAG, pre-storage integration).
- Increment minor version upon implementing a major subsystem (storage, embeddings, billing, memory).

## 23. Next Immediate Engineering Actions

1. Implement `lib/nango.ts` and supporting server actions.
2. Add R2 integration + file upload mutation + file listing queries.
3. Choose embedding provider; create ingestion job for existing PDFs.
4. Add pgvector extension migration (or evaluate external vector DB SLAs).
5. Introduce memory schema + summarization cron.

## 24. Change Log (Initialization)

| Date       | Change                                    |
| ---------- | ----------------------------------------- |
| 2025-11-09 | Initial technical documentation authored. |

---

Last Updated: 2025-11-09
Repository: `salesorbit-web` (main branch)
Owner: `SalesOrbit0`
Document Maintainer: Engineering Team
