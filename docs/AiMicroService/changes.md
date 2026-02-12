# AI Microservice Layer — Changes

## Overview

Rewrote the `src/lib/ai-microservice/` integration layer to fully match the FastAPI microservice spec. All endpoints, types, error classes, and streaming protocol are now covered. Zero breaking changes to existing consumers.

---

## Files Changed

### `types.ts` — Full rewrite

**Before:** Minimal types covering only chat, embeddings, OCR, column-mappings, row-to-sentence, and text generation.

**After:** Complete type definitions for every microservice endpoint and the streaming wire protocol.

| Addition | Description |
|---|---|
| `ChatMessage` | Full message shape with `id`, `role`, `content`, `toolCalls`, `attachments`, `reasoning` |
| `ChatToolCall` | Tool call structure: `id`, `name`, `args`, `state`, `result` |
| `ChatStreamRequest` | Full chat request with `messages`, `id`, `provider`, `enabledToolkits`, `user_id`, `tools_config`, `user_preferences`, `user_context`, `rag_context`, `memory_context`, `chunk_data` |
| `EnabledToolkit` | `{ slug, isConnected }` |
| `UserPreferences` | Includes `systempreferences.customsystemprompt` |
| `UserContext` | `fileCount`, `recentFiles`, `chatCount`, `recentChatTitles` |
| `RAGContext`, `ChunkData` | Shared context/chunk types used across RAG and chat |
| `StreamEvent` | Union type for all 4 stream event prefixes |
| `StreamTextEvent` (`0:`) | Text delta |
| `StreamReasoningEvent` (`2:`) | Reasoning delta |
| `StreamToolCallStartEvent` (`9:`) | Tool call initiation |
| `StreamToolCallResultEvent` (`a:`) | Tool call result |
| `RAGSearchRequest` / `RAGSearchResponse` | Global RAG search with `query`, `chunks`, `top_k`, `min_similarity` → `results[]`, `structured_context` |
| `LocalRAGSearchRequest` / `LocalRAGSearchResponse` | Project/file-scoped RAG with `project_ids`, `file_ids` |
| `FileProcessingResult` | Single file result: `text`, `chunks`, `embeddings`, `metadata`, `text_length`, `chunks_count` |
| `BatchFileProcessingResponse` | Batch result with `total_files`, `total_text_length`, `total_chunks_count` |
| `HealthCheckResponse` | `{ status, latencyMs }` |

All previously existing types (`EmbeddingRequest`, `EmbeddingResponse`, `OcrRequest`, `OcrResponse`, `GenerateColumnMappingsRequest/Response`, `ConvertRowToSentenceRequest/Response`, `TextGenerationRequest`) are preserved unchanged.

---

### `config.ts` — Extended

**Added:**

| Property | Default | Description |
|---|---|---|
| `streamTimeout` | `120000` (2 min) | Timeout for streaming chat requests |
| `fileProcessingTimeout` | `300000` (5 min) | Timeout for file processing requests |
| `healthCheckTimeout` | `5000` (5 sec) | Timeout for health checks |
| `aiMicroserviceEndpoints` | — | Centralized endpoint path constants for all 11 routes |

**Endpoint paths defined:**

```
/health
/api/v1/chat
/api/v1/rag-search
/api/v1/local-rag-search
/api/v1/process-file
/api/v1/process-files
/api/v1/embeddings
/api/v1/file-processing/ocr
/api/v1/file-processing/column-mappings
/api/v1/file-processing/row-to-sentence
/api/v1/generate-text
```

Also replaced `parseInt(x || y)` with `Number.parseInt(x ?? y, 10)` and `||` with `??` per project lint rules.

---

### `errors.ts` — Extended

**Added:**

| Error Class | Status Code | Use Case |
|---|---|---|
| `AIMicroserviceStreamError` | 502 | Stream parsing failures, mid-stream disconnects |
| `AIMicroserviceFileProcessingError` | 500 (default) | File processing failures (single or batch) |

**Changed:**

- `AIMicroserviceTimeoutError` now accepts an optional `timeoutMs` parameter for more descriptive error messages.

---

### `client.ts` — Full rewrite

**New methods:**

| Method | Endpoint | Description |
|---|---|---|
| `chatStream(request)` | `POST /api/v1/chat` | Streaming chat with tool calling. Uses `streamTimeout`. Returns `ReadableStream`. |
| `ragSearch(request)` | `POST /api/v1/rag-search` | Global RAG search. Backend supplies chunks; microservice ranks by similarity. |
| `localRagSearch(request)` | `POST /api/v1/local-rag-search` | Project/file-scoped RAG search with `project_ids` and `file_ids` filters. |
| `processFile(file, fileName?)` | `POST /api/v1/process-file` | Single file processing via multipart form-data. Uses `fileProcessingTimeout`. |
| `processFiles(files, fileNames?)` | `POST /api/v1/process-files` | Batch file processing via multipart form-data. |

**Preserved methods** (signatures unchanged, no breaking changes):

- `healthCheck()`
- `embedMany(request)` / `embedOne(text, taskType?, outputDimensionality?)`
- `performOcr(request)`
- `generateColumnMappings(request)`
- `convertRowToSentence(request)`
- `generateText(request)`

**Structural changes:**

- Constructor now accepts `streamTimeout` and `fileProcessingTimeout` options.
- All endpoint URLs use `aiMicroserviceEndpoints` constants instead of hardcoded strings.
- Private `delay()` renamed to `sleep()`.
- Class fields marked `readonly`.
- Timeout errors now include the timeout duration in the message.

---

### `stream-parser.ts` — New file

Handles the microservice's custom streaming wire protocol (`<prefix>:<json>\n`).

| Export | Description |
|---|---|
| `parseStreamLine(line)` | Parses a single line into a typed `StreamEvent` or `null` |
| `consumeChatStream(stream, handler)` | Event-driven consumer — takes a `ReadableStream` and dispatches to `ChatStreamHandler` callbacks |
| `createTextDeltaStream(sourceStream)` | Transforms raw stream into `ReadableStream<string>` yielding only text deltas (prefix `0:`). Ideal for piping to Next.js streaming `Response`. |
| `ChatStreamHandler` (type) | Callback interface: `onTextDelta`, `onReasoningDelta`, `onToolCallStart`, `onToolCallResult`, `onError`, `onDone` |

---

### `index.ts` — Updated barrel exports

All new types, error classes, config exports, and stream parser utilities are re-exported. Organized into sections: Client, Stream parser, Types, Errors, Config.

---

## No Breaking Changes

Existing consumers (`src/lib/embeddings.ts`, `src/lib/file-processing.ts`, `src/queries/chat.ts`) all import `aiMicroserviceClient` from the barrel and call methods whose signatures are unchanged. Zero compile errors after the changes.

## Testing Results

Created comprehensive test scripts in `scripts/`:
- `quick-health-check.ts` - Fast health check (2 seconds)
- `test-available-endpoints.ts` - Full endpoint testing (comprehensive)
- `test-chat-interactive.ts` - Interactive chat REPL
- `README.md` - Testing documentation

### Available Endpoints (Tested & Working ✅)
- `/health` - Health check (✅ 24ms latency)
- `/api/v1/chat` - Streaming chat (✅ working)
- `/api/v1/rag-search` - Global RAG search (✅ working)
- `/api/v1/local-rag-search` - Project-scoped RAG (✅ working)
- `/api/v1/process-file` - Single file processing (✅ working)
- `/api/v1/process-files` - Batch processing (⚠️ 500 error - microservice bug)

### Missing Endpoints (Not Implemented in Microservice ❌)
- `/api/v1/embeddings`
- `/api/v1/file-processing/ocr`
- `/api/v1/file-processing/column-mappings`
- `/api/v1/file-processing/row-to-sentence`
- `/api/v1/generate-text`

### Type Corrections
Updated `ChatMessage.id` from optional to required to match microservice validation requirements.

## Protocol Fix (Critical)

### Issue Discovered
The microservice sends a **different protocol format** than initially specified:

**Actual format:**
```
0:"text content"
0:"more text"
```

**Initially expected:**
```
0:{"content":"text content"}
0:{"content":"more text"}
```

### Solution
Updated `stream-parser.ts` to support **both formats** for maximum compatibility:
- Direct JSON strings: `0:"text"` (current microservice format)
- Object format: `0:{"content":"text"}` (future-proof)

The parser now:
1. Parses the JSON value after the colon
2. Checks if it's a string or object
3. Extracts content accordingly
4. Validates that content exists before emitting events

### Additional Improvements

**Stream Parser (`stream-parser.ts`):**
- ✅ Validates content exists and is a string before using it
- ✅ Skips malformed events gracefully (no crashes)
- ✅ Validates required fields for all event types (toolCallId, toolName, etc.)
- ✅ Handles both string and object formats for text/reasoning events

**Interactive Chat (`test-chat-interactive.ts`):**
- ✅ Shows tool call arguments (first 100 chars)
- ✅ Shows tool result success status
- ✅ Tracks tool call count
- ✅ Shows clear warnings when response is empty or contains only tool calls
- ✅ Better error handling with onError callback
- ✅ Displays reasoning deltas if extended thinking is used

**New Test Scripts:**
- `test-quick-chat.ts` - Fast validation (5 seconds)
- `test-chat-debug.ts` - Raw protocol debugging
- `test-available-endpoints.ts` - Tests only implemented endpoints

### Usage

```bash
# Quick check (2 seconds)
npx tsx scripts/quick-health-check.ts

# Quick chat test (5 seconds)
npx tsx scripts/test-quick-chat.ts

# Test implemented endpoints
npx tsx scripts/test-available-endpoints.ts

# Interactive chat
npx tsx scripts/test-chat-interactive.ts

# Debug protocol (advanced)
npx tsx scripts/test-chat-debug.ts
```
