# Task Notes: AI Microservice Integration — Partial

## Overview

Refactoring TypeScript backend to delegate AI operations to a Python microservice.
**Status**: Embeddings, file processing, and title generation are migrated. Chat streaming is **NOT yet migrated** — it still calls the AI SDK directly.

## Architecture

### Current State

```
                          ┌──────────────────────────────────┐
                          │   Python Microservice             │
                          │   (embeddings, OCR, text gen)     │
                          └──────┬───────────────────────────┘
                                 │
Next.js ──► TypeScript Client ───┘   (embeddings, file processing, title gen)
       │
       └──► @ai-sdk/google + streamText()   (chat streaming — NOT migrated)
```

- **Migrated to microservice**: embeddings, OCR, column mappings, row-to-sentence, title generation
- **Still using direct AI SDK**: chat streaming (`src/app/api/chat/route.ts`)

## Changes Made

### 1. ✅ Created AI Microservice Client (`src/lib/ai-microservice/`)

- `client.ts` — HTTP client with retry logic, timeout handling, error propagation
- `types.ts` — Request/response interfaces for all endpoints
- `errors.ts` — Custom error classes (`AIMicroserviceError`, `ConnectionError`, `TimeoutError`, `ValidationError`)
- `config.ts` — Environment configuration with validation
- `index.ts` — Clean re-exports

**Key Methods:**

- `chatStream(request)` — Streaming chat (defined in client, **not yet used by chat route**)
- `embedOne(text, taskType, dimensionality)` — Single text embedding
- `embedMany(request)` — Batch embeddings
- `performOcr(request)` — Document/image OCR
- `generateColumnMappings(headers)` — Semantic column type detection
- `convertRowToSentence(row, mappings)` — CSV row to natural language
- `generateText(prompt)` — General text generation (used for chat title generation)

**Retry Strategy:**

- 3 automatic retries with exponential backoff (1s, 2s, 4s)
- Only retries 5xx errors and network failures
- 4xx client errors are thrown immediately (no retry)
- `chatStream()` is NOT wrapped in `retryableRequest` (streaming is non-retryable by design)

### 2. ❌ Chat API — NOT YET MIGRATED (`src/app/api/chat/route.ts`)

The chat route **still uses the AI SDK directly**:

```typescript
// Current code in route.ts:
import { streamText, ... } from "ai";
import { google } from "@ai-sdk/google";

const result = streamText({
  model: google("gemini-2.5-flash"),
  system: systemPrompt,
  messages: coreMessages,
  tools,
  maxOutputTokens: 4096,
  temperature: 0.5,
  onFinish: async ({ response, usage }) => { ... },
});

return result.toUIMessageStreamResponse({ ... });
```

**What's still in chat route:**

- `streamText` from `"ai"` — direct AI SDK streaming
- `google` from `"@ai-sdk/google"` — model provider
- `@ai-sdk/mcp` — MCP client for Composio integrations
- All tool definitions (Firecrawl, RAG, memory, Composio, etc.)
- System prompt building, message persistence, token usage tracking

**What would need to change to migrate:**

- Replace `streamText({ model: google(...) })` with `aiMicroserviceClient.chatStream()`
- Serialize tool definitions to JSON for microservice
- Handle SSE response from microservice instead of AI SDK's stream
- Decide how to handle MCP tools + Composio integration across the service boundary

### 3. ✅ Refactored Embeddings (`src/lib/embeddings.ts`)

**Removed:** Direct `embed()` and `embedMany()` from `@ai-sdk/google`

**Now uses:**

```typescript
// src/lib/embeddings.ts
import { aiMicroserviceClient } from "@/lib/ai-microservice";

export async function generateEmbedding(text: string): Promise<number[]> {
  return await aiMicroserviceClient.embedOne(
    text,
    "SEMANTIC_SIMILARITY",
    EMBEDDING_DIMENSION   // from serverEnv.EMBEDDINGS_DIMENSION (default: 768)
  );
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const result = await aiMicroserviceClient.embedMany({
    texts,
    taskType: "SEMANTIC_SIMILARITY",
    outputDimensionality: EMBEDDING_DIMENSION,
  });
  return result.embeddings;
}
```

**Preserved (non-AI, kept as-is):**

- `chunkText()` — Recursive text chunking with overlap
- `cosineSimilarity()` — Vector similarity calculation
- `findSimilarChunks()` — Semantic search over embeddings
- `prepareRAGContext()` — Context formatting for LLM

### 4. ✅ Refactored File Processing (`src/lib/file-processing.ts`)

**Removed:** Direct `generateText()` calls from `@ai-sdk/google`

**Migrated functions (all use `aiMicroserviceClient`):**

| Function | Microservice Call | Fallback on Error |
|---|---|---|
| `generateColumnMappings(headers)` | `aiMicroserviceClient.generateColumnMappings({ headers })` | Simple lowercase mapping |
| `convertRowToSentence(row, mappings)` | `aiMicroserviceClient.convertRowToSentence({ row, mappings })` | Concatenated values |
| `performOcrWithGemini(buffer, mimeType, fileName?)` | `aiMicroserviceClient.performOcr({ fileData: base64, mimeType, fileName })` | Throws error |

**Preserved (non-AI logic, kept as-is):**

- File type validation & MIME type mappings
- DOCX parsing (mammoth)
- PPTX parsing (JSZip + XML extraction)
- Excel/CSV parsing (xlsx, papaparse)
- Plain text processing
- Metadata extraction

### 5. ✅ Refactored Title Generation (`src/queries/chat.ts`)

**Removed:** `generateText` and `google` imports from AI SDK

**Now uses:**

```typescript
// src/queries/chat.ts
import { aiMicroserviceClient } from "@/lib/ai-microservice";

export async function generateTitleFromUserMessage({ message: uiMessage }) {
  const title = await aiMicroserviceClient.generateText({
    prompt: `You are an expert title generator. Generate a short title...
    Message: ${JSON.stringify(uiMessage)}`,
    maxTokens: 20,
    temperature: 0.7,
  });
  return title.trim();
}
```

### 6. ✅ Updated Environment Configuration (`src/env/index.ts`)

**Added:**

```typescript
AI_MICROSERVICE_URL: z.string().url().default("http://localhost:8000"),
AI_MICROSERVICE_TIMEOUT: z.coerce.number().default(30000),
AI_MICROSERVICE_RETRIES: z.coerce.number().default(3),
```

**Current state of AI keys:**

| Variable | Status | Reason |
|---|---|---|
| `GOOGLE_API_KEY` | **Required** (`z.string().min(1)`) | Still needed — chat route calls Google directly |
| `MISTRAL_API_KEY` | Optional (`z.string().min(1).optional()`) | Not actively used |

> **Note:** `GOOGLE_API_KEY` stays required until the chat route is migrated to the microservice.

### 7. ✅ Created Unit Tests

- Location: `src/lib/ai-microservice/client.test.ts`
- Framework: Vitest with mocked fetch
- Coverage: Constructor, embeddings, OCR, column mappings, row-to-sentence, chat streaming, text generation, retry logic, error handling

## Environment Variables

```bash
# Required for microservice operations (embeddings, OCR, file processing, title gen)
AI_MICROSERVICE_URL=http://localhost:8000
AI_MICROSERVICE_TIMEOUT=30000
AI_MICROSERVICE_RETRIES=3

# STILL REQUIRED — chat route uses Google directly
GOOGLE_API_KEY=<your-key>

# Optional
MISTRAL_API_KEY=<optional>
```

## API Contracts (Microservice Endpoints)

### Embeddings

```
POST /api/v1/embeddings
Request:  { texts: string[], taskType?: string, outputDimensionality?: number }
Response: { embeddings: number[][], model: string, usage?: { promptTokens?, totalTokens? } }
```

### OCR

```
POST /api/v1/file-processing/ocr
Request:  { fileData: string (base64), mimeType: string, fileName?: string }
Response: { text: string, metadata?: Record<string, unknown> }
```

### Column Mappings

```
POST /api/v1/file-processing/column-mappings
Request:  { headers: string[] }
Response: { mappings: Record<string, string> }
```

### Row-to-Sentence

```
POST /api/v1/file-processing/row-to-sentence
Request:  { row: Record<string, string>, mappings: Record<string, string> }
Response: { sentence: string }
```

### Text Generation

```
POST /api/v1/generate-text
Request:  { prompt: string, model?: string, temperature?: number, maxTokens?: number }
Response: { text: string }
```

### Chat Streaming (defined in client, NOT YET USED)

```
POST /api/v1/chat
Request:  { messages: Array<{role, content}>, model?, system?, tools?, temperature?, maxTokens? }
Response: ReadableStream (SSE)
```

## What's Done vs What Remains

### ✅ Completed

| Component | File | Uses Microservice |
|---|---|---|
| Microservice client | `src/lib/ai-microservice/*` | N/A (the client itself) |
| Embeddings | `src/lib/embeddings.ts` | `embedOne()`, `embedMany()` |
| OCR | `src/lib/file-processing.ts` | `performOcr()` |
| Column mappings | `src/lib/file-processing.ts` | `generateColumnMappings()` |
| Row-to-sentence | `src/lib/file-processing.ts` | `convertRowToSentence()` |
| Title generation | `src/queries/chat.ts` | `generateText()` |
| Unit tests | `src/lib/ai-microservice/client.test.ts` | Mocked fetch |

### ❌ Not Yet Done

| Component | File | Current State |
|---|---|---|
| Chat streaming | `src/app/api/chat/route.ts` | Still uses `streamText()` + `google()` from AI SDK directly |
| Remove `@ai-sdk/google` from chat | `src/app/api/chat/route.ts` | `google("gemini-2.5-flash")` still called |
| Make `GOOGLE_API_KEY` optional | `src/env/index.ts` | Still required for chat route |

### Challenges for Chat Migration

1. **Tool serialization** — Chat route defines tools using Zod schemas and `tool()` from AI SDK. The microservice would need to accept and execute these.
2. **MCP/Composio integration** — Tools are dynamically fetched per-session via MCP protocol. Passing these through a microservice adds complexity.
3. **Streaming format** — Current route returns `result.toUIMessageStreamResponse()`. Microservice streaming would need a compatible format adapter.
4. **`onFinish` callback** — Token usage recording and message persistence happen via `streamText`'s `onFinish`. This logic would need to be reimplemented for microservice streaming.

## Running Locally

```bash
# 1. Start Python microservice
cd ai-microservice/
python -m uvicorn main:app --reload --port 8000
curl http://localhost:8000/health

# 2. Configure and run backend
cp .env.example .env.local
# Set: AI_MICROSERVICE_URL, GOOGLE_API_KEY, DATABASE_URL, etc.
pnpm install
pnpm dev

# 3. Run tests
pnpm test src/lib/ai-microservice
```

## Future Improvements

### Phase 1 — Complete Migration

- [ ] Migrate chat route to use `aiMicroserviceClient.chatStream()`
- [ ] Handle tool serialization for microservice
- [ ] Implement SSE-to-UIMessageStream adapter
- [ ] Make `GOOGLE_API_KEY` optional after chat migration
- [ ] Remove `@ai-sdk/google` dependency from backend

### Phase 2 — Resilience

- [ ] Circuit breaker pattern for microservice failures
- [ ] Redis caching for embeddings
- [ ] Health check endpoint integration
- [ ] OpenTelemetry instrumentation

### Phase 3 — Optimization

- [ ] Request/response compression (gzip)
- [ ] Tool definition caching
- [ ] Rate limiting per user
- [ ] Streaming resume on network interruption
