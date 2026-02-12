// ─── Chat Types ──────────────────────────────────────────────────────────────

export interface ChatToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  state?: string;
  result?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string; // Required by microservice
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCalls?: ChatToolCall[];
  attachments?: unknown[];
  reasoning?: string;
}

export interface EnabledToolkit {
  slug: string;
  isConnected: boolean;
}

export interface UserPreferences {
  systempreferences?: {
    customsystemprompt?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface UserContext {
  fileCount?: number;
  recentFiles?: Array<{ name: string; id: string }>;
  chatCount?: number;
  recentChatTitles?: string[];
  [key: string]: unknown;
}

export interface RAGContext {
  [key: string]: unknown;
}

export interface ChunkData {
  content: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
}

export interface ChatStreamRequest {
  messages: ChatMessage[];
  id: string;
  provider?: string;
  enabledToolkits?: EnabledToolkit[];
  user_id: string;
  tools_config?: Record<string, unknown>;
  user_preferences?: UserPreferences;
  user_context?: UserContext;
  rag_context?: RAGContext;
  memory_context?: string[];
  chunk_data?: ChunkData[];
}

// Stream event types from the AI microservice
// Format: <prefix>:<json>
// 0 = text delta, 2 = reasoning delta, 9 = tool call start, a = tool call result
export type StreamEventPrefix = "0" | "2" | "9" | "a";

export interface StreamTextEvent {
  prefix: "0";
  content: string;
}

export interface StreamReasoningEvent {
  prefix: "2";
  content: string;
}

export interface StreamToolCallStartEvent {
  prefix: "9";
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
}

export interface StreamToolCallResultEvent {
  prefix: "a";
  toolCallId: string;
  result: Record<string, unknown>;
}

export type StreamEvent =
  | StreamTextEvent
  | StreamReasoningEvent
  | StreamToolCallStartEvent
  | StreamToolCallResultEvent;

// ─── RAG Types ───────────────────────────────────────────────────────────────

export interface RAGSearchRequest {
  query: string;
  chunks: ChunkData[];
  top_k?: number;
  min_similarity?: number;
}

export interface RAGSearchResult {
  content: string;
  similarity: number;
  metadata?: Record<string, unknown>;
}

export interface RAGSearchResponse {
  success: boolean;
  results: RAGSearchResult[];
  query: string;
  total_results: number;
  structured_context?: string;
}

// ─── Local RAG Types ─────────────────────────────────────────────────────────

export interface LocalRAGSearchRequest {
  query: string;
  chunks: ChunkData[];
  project_ids?: string[];
  file_ids?: string[];
  top_k?: number;
  min_similarity?: number;
}

export interface LocalRAGSearchResponse {
  success: boolean;
  results: RAGSearchResult[];
  query: string;
  total_results: number;
}

// ─── File Processing Types ───────────────────────────────────────────────────

export interface FileProcessingResult {
  success: boolean;
  text: string;
  chunks: string[];
  embeddings: number[][];
  metadata: Record<string, unknown>;
  text_length: number;
  chunks_count: number;
}

export interface BatchFileProcessingResponse {
  success: boolean;
  results: FileProcessingResult[];
  total_files: number;
  total_text_length: number;
  total_chunks_count: number;
}

// ─── Embedding Types ─────────────────────────────────────────────────────────

export interface EmbeddingRequest {
  texts: string[];
  model?: string;
  taskType?: "SEMANTIC_SIMILARITY" | "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";
  outputDimensionality?: number;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage?: {
    promptTokens?: number;
    totalTokens?: number;
  };
}

// ─── OCR Types ───────────────────────────────────────────────────────────────

export interface OcrRequest {
  fileUrl?: string;
  fileData?: string; // base64
  mimeType: string;
  fileName?: string;
}

export interface OcrResponse {
  text: string;
  metadata?: Record<string, unknown>;
}

// ─── Column Mapping / Row-to-Sentence Types ──────────────────────────────────

export interface GenerateColumnMappingsRequest {
  headers: string[];
}

export interface GenerateColumnMappingsResponse {
  mappings: Record<string, string>;
}

export interface ConvertRowToSentenceRequest {
  row: Record<string, string>;
  mappings: Record<string, string>;
}

export interface ConvertRowToSentenceResponse {
  sentence: string;
}

// ─── Text Generation Types ───────────────────────────────────────────────────

export interface TextGenerationRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// ─── Health Check Types ──────────────────────────────────────────────────────

export interface HealthCheckResponse {
  status: string;
  latencyMs: number;
}
