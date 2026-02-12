/**
 * AI Microservice configuration
 *
 * The microservice is a FastAPI service handling:
 * - Chat with streaming + tool calling
 * - RAG search (global & local)
 * - File processing (single & batch)
 * - Embedding generation
 * - OCR, column-mapping, row-to-sentence, text generation
 *
 * The microservice does NOT handle persistent storage — the backend owns all
 * durable state (chat history, files, embeddings, user prefs).
 */

export const aiMicroserviceConfig = {
  /** Base URL of the FastAPI microservice */
  baseUrl: process.env.AI_MICROSERVICE_URL ?? "http://localhost:8000",

  /** Default request timeout (ms) — used for non-streaming endpoints */
  timeout: Number.parseInt(process.env.AI_MICROSERVICE_TIMEOUT ?? "30000", 10),

  /** Retry count for retryable (non-streaming) requests */
  retries: Number.parseInt(process.env.AI_MICROSERVICE_RETRIES ?? "3", 10),

  /** Timeout for streaming chat requests (ms) — longer than default */
  streamTimeout: Number.parseInt(
    process.env.AI_MICROSERVICE_STREAM_TIMEOUT ?? "120000",
    10
  ),

  /** Timeout for file processing requests (ms) — can be very long */
  fileProcessingTimeout: Number.parseInt(
    process.env.AI_MICROSERVICE_FILE_TIMEOUT ?? "300000",
    10
  ),

  /** Health check timeout (ms) */
  healthCheckTimeout: 5000,
} as const;

/** API endpoint paths served by the microservice */
export const aiMicroserviceEndpoints = {
  health: "/health",
  chat: "/api/v1/chat",
  ragSearch: "/api/v1/rag-search",
  localRagSearch: "/api/v1/local-rag-search",
  processFile: "/api/v1/process-file",
  processFiles: "/api/v1/process-files",
  embeddings: "/api/v1/embeddings",
  ocr: "/api/v1/file-processing/ocr",
  columnMappings: "/api/v1/file-processing/column-mappings",
  rowToSentence: "/api/v1/file-processing/row-to-sentence",
  generateText: "/api/v1/generate-text",
} as const;

export function validateConfig(): void {
  if (
    !process.env.AI_MICROSERVICE_URL &&
    process.env.NODE_ENV === "production"
  ) {
    throw new Error(
      "AI_MICROSERVICE_URL environment variable is required in production"
    );
  }
}
