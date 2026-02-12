# AI Microservice Integration — Status Summary

## Project Status: PARTIALLY COMPLETE

Embeddings, file processing, and title generation are migrated to the Python microservice. **Chat streaming is NOT migrated** — it still uses `@ai-sdk/google` and `streamText()` directly.

---

## Deliverables

### New Files (Created)

| File | Purpose |
|---|---|
| `src/lib/ai-microservice/client.ts` | HTTP client with retry, timeout, error handling |
| `src/lib/ai-microservice/types.ts` | Request/response TypeScript interfaces |
| `src/lib/ai-microservice/errors.ts` | Custom error classes |
| `src/lib/ai-microservice/config.ts` | Environment configuration |
| `src/lib/ai-microservice/index.ts` | Clean re-exports |
| `src/lib/ai-microservice/client.test.ts` | Unit tests (Vitest) |

### Modified Files

| File | What Changed |
|---|---|
| `src/lib/embeddings.ts` | Replaced AI SDK `embed()`/`embedMany()` with `aiMicroserviceClient.embedOne()`/`embedMany()` |
| `src/lib/file-processing.ts` | Replaced AI SDK `generateText()` with `aiMicroserviceClient.performOcr()`, `.generateColumnMappings()`, `.convertRowToSentence()` |
| `src/queries/chat.ts` | Replaced AI SDK `generateText()` + `google()` with `aiMicroserviceClient.generateText()` for title generation |
| `src/env/index.ts` | Added `AI_MICROSERVICE_URL`, `AI_MICROSERVICE_TIMEOUT`, `AI_MICROSERVICE_RETRIES` |

### NOT Modified (Still Uses AI SDK Directly)

| File | What It Still Does |
|---|---|
| `src/app/api/chat/route.ts` | Uses `streamText()` from `"ai"` + `google("gemini-2.5-flash")` from `"@ai-sdk/google"` |

---

## Migration Status by Operation

| Operation | Old Approach | New Approach | Status |
|---|---|---|---|
| Embeddings (single) | `embed()` from `@ai-sdk/google` | `aiMicroserviceClient.embedOne()` | ✅ Done |
| Embeddings (batch) | `embedMany()` from `@ai-sdk/google` | `aiMicroserviceClient.embedMany()` | ✅ Done |
| OCR | `generateText()` with Gemini Vision | `aiMicroserviceClient.performOcr()` | ✅ Done |
| Column mappings | `generateText()` with prompt | `aiMicroserviceClient.generateColumnMappings()` | ✅ Done |
| Row-to-sentence | `generateText()` with prompt | `aiMicroserviceClient.convertRowToSentence()` | ✅ Done |
| Chat title generation | `generateText()` + `google()` | `aiMicroserviceClient.generateText()` | ✅ Done |
| **Chat streaming** | `streamText()` + `google()` | Should use `aiMicroserviceClient.chatStream()` | ❌ **Not done** |

---

## Environment Variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `AI_MICROSERVICE_URL` | Yes (has default) | `http://localhost:8000` | Microservice base URL |
| `AI_MICROSERVICE_TIMEOUT` | No | `30000` | Request timeout (ms) |
| `AI_MICROSERVICE_RETRIES` | No | `3` | Max retry attempts |
| `GOOGLE_API_KEY` | **Yes** | — | Still required — chat route calls Google directly |
| `MISTRAL_API_KEY` | No | — | Optional, not actively used |

---

## Running

```bash
# Microservice
cd ai-microservice/ && python -m uvicorn main:app --reload --port 8000

# Backend
pnpm dev

# Tests
pnpm test src/lib/ai-microservice
```

---

## Remaining Work

1. **Migrate chat streaming** — Replace `streamText()` + `google()` in `src/app/api/chat/route.ts` with `aiMicroserviceClient.chatStream()`
2. **Tool serialization** — Serialize Zod-based tool definitions to JSON for the microservice
3. **MCP/Composio tools** — Decide how to handle dynamically-fetched MCP tools across the service boundary
4. **Streaming adapter** — Convert microservice SSE output to `UIMessageStreamResponse` format
5. **`onFinish` handling** — Re-implement token usage tracking and message persistence for microservice streaming
6. **Make `GOOGLE_API_KEY` optional** — Only after chat route is fully migrated

---

**Last Updated**: February 10, 2026
