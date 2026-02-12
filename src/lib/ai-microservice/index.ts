/**
 * AI Microservice client — integration layer for the FastAPI AI service.
 *
 * The microservice handles: chat streaming, RAG search, file processing,
 * embeddings, OCR, and text generation. It does NOT own persistent storage;
 * the Next.js backend is responsible for all durable state.
 */

// ─── Client ────────────────────────────────────────────────────────────────────
export { AIMicroserviceClient, aiMicroserviceClient } from "./client";

// ─── Stream parser ─────────────────────────────────────────────────────────────
export {
  parseStreamLine,
  consumeChatStream,
  createTextDeltaStream,
} from "./stream-parser";
export type { ChatStreamHandler } from "./stream-parser";

// ─── Types ─────────────────────────────────────────────────────────────────────
export type {
  // Chat
  ChatMessage,
  ChatToolCall,
  ChatStreamRequest,
  EnabledToolkit,
  UserPreferences,
  UserContext,
  RAGContext,
  ChunkData,
  // Stream events
  StreamEvent,
  StreamEventPrefix,
  StreamTextEvent,
  StreamReasoningEvent,
  StreamToolCallStartEvent,
  StreamToolCallResultEvent,
  // RAG
  RAGSearchRequest,
  RAGSearchResult,
  RAGSearchResponse,
  LocalRAGSearchRequest,
  LocalRAGSearchResponse,
  // File processing
  FileProcessingResult,
  BatchFileProcessingResponse,
  // Embeddings
  EmbeddingRequest,
  EmbeddingResponse,
  // OCR
  OcrRequest,
  OcrResponse,
  // Column mappings / row-to-sentence
  GenerateColumnMappingsRequest,
  GenerateColumnMappingsResponse,
  ConvertRowToSentenceRequest,
  ConvertRowToSentenceResponse,
  // Text generation
  TextGenerationRequest,
  // Health
  HealthCheckResponse,
} from "./types";

// ─── Errors ────────────────────────────────────────────────────────────────────
export {
  AIMicroserviceError,
  AIMicroserviceConnectionError,
  AIMicroserviceTimeoutError,
  AIMicroserviceValidationError,
  AIMicroserviceStreamError,
  AIMicroserviceFileProcessingError,
} from "./errors";

// ─── Config ────────────────────────────────────────────────────────────────────
export {
  aiMicroserviceConfig,
  aiMicroserviceEndpoints,
  validateConfig,
} from "./config";
