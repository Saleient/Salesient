import { aiMicroserviceConfig, aiMicroserviceEndpoints } from "./config";
import {
  AIMicroserviceError,
  AIMicroserviceConnectionError,
  AIMicroserviceTimeoutError,
  AIMicroserviceFileProcessingError,
} from "./errors";
import type {
  ChatStreamRequest,
  EmbeddingRequest,
  EmbeddingResponse,
  OcrRequest,
  OcrResponse,
  GenerateColumnMappingsRequest,
  GenerateColumnMappingsResponse,
  ConvertRowToSentenceRequest,
  ConvertRowToSentenceResponse,
  TextGenerationRequest,
  RAGSearchRequest,
  RAGSearchResponse,
  LocalRAGSearchRequest,
  LocalRAGSearchResponse,
  FileProcessingResult,
  BatchFileProcessingResponse,
  HealthCheckResponse,
} from "./types";

/**
 * Client for the AI Microservice (FastAPI).
 *
 * The microservice owns:
 *   - Chat streaming with tool calling
 *   - RAG search (global + local / project-scoped)
 *   - File processing (text extraction, chunking, embeddings)
 *   - Embedding generation
 *   - OCR / column-mapping / row-to-sentence / text generation
 *
 * The microservice does NOT own persistent storage — this Next.js backend is
 * responsible for storing chat history, files, embeddings, and user prefs.
 */
export class AIMicroserviceClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly streamTimeout: number;
  private readonly fileProcessingTimeout: number;
  private readonly healthCheckTimeout: number;

  constructor(config?: {
    baseUrl?: string;
    timeout?: number;
    maxRetries?: number;
    streamTimeout?: number;
    fileProcessingTimeout?: number;
  }) {
    this.baseUrl = config?.baseUrl ?? aiMicroserviceConfig.baseUrl;
    this.timeout = config?.timeout ?? aiMicroserviceConfig.timeout;
    this.maxRetries = config?.maxRetries ?? aiMicroserviceConfig.retries;
    this.streamTimeout =
      config?.streamTimeout ?? aiMicroserviceConfig.streamTimeout;
    this.fileProcessingTimeout =
      config?.fileProcessingTimeout ??
      aiMicroserviceConfig.fileProcessingTimeout;
    this.healthCheckTimeout = aiMicroserviceConfig.healthCheckTimeout;
  }

  // ─── Health ──────────────────────────────────────────────────────────────────

  async healthCheck(): Promise<HealthCheckResponse> {
    const start = Date.now();
    try {
      const response = await fetch(
        `${this.baseUrl}${aiMicroserviceEndpoints.health}`,
        {
          signal: AbortSignal.timeout(this.healthCheckTimeout),
        }
      );
      const latencyMs = Date.now() - start;

      if (!response.ok) {
        throw new AIMicroserviceError(
          `Health check failed: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      return { status: "ok", latencyMs };
    } catch (error) {
      if (error instanceof AIMicroserviceError) {
        throw error;
      }
      if (error instanceof DOMException && error.name === "TimeoutError") {
        throw new AIMicroserviceTimeoutError(this.healthCheckTimeout);
      }
      throw new AIMicroserviceConnectionError(
        `Cannot reach microservice at ${this.baseUrl}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  // ─── Chat (Streaming) ───────────────────────────────────────────────────────

  /**
   * Send a chat request and receive a streaming `ReadableStream`.
   *
   * The stream uses a line-based protocol:
   *   0:{"content":"…"}   – text delta
   *   2:{"content":"…"}   – reasoning delta
   *   9:{toolCallId,toolName,args}  – tool call start
   *   a:{toolCallId,result}         – tool call result
   */
  async chatStream(request: ChatStreamRequest): Promise<ReadableStream> {
    try {
      const response = await fetch(
        `${this.baseUrl}${aiMicroserviceEndpoints.chat}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
          signal: AbortSignal.timeout(this.streamTimeout),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AIMicroserviceError(
          (errorData as Record<string, string>).message ??
            `Chat stream failed: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      if (!response.body) {
        throw new AIMicroserviceError("No response body from chat stream", 502);
      }

      return response.body;
    } catch (error) {
      if (error instanceof AIMicroserviceError) {
        throw error;
      }
      if (error instanceof DOMException && error.name === "TimeoutError") {
        throw new AIMicroserviceTimeoutError(this.streamTimeout);
      }
      throw new AIMicroserviceConnectionError(
        "Chat stream connection failed",
        error instanceof Error ? error : undefined
      );
    }
  }

  // ─── RAG Search ──────────────────────────────────────────────────────────────

  /**
   * Global RAG search across all user documents using vector similarity.
   *
   * The backend must supply chunks (content + embeddings) retrieved from the
   * database — the microservice performs similarity ranking and returns the
   * top-k results with a structured_context string suitable for injection into
   * the system prompt.
   */
  async ragSearch(request: RAGSearchRequest): Promise<RAGSearchResponse> {
    return this.retryableRequest<RAGSearchResponse>(
      `${this.baseUrl}${aiMicroserviceEndpoints.ragSearch}`,
      { method: "POST", body: JSON.stringify(request) }
    );
  }

  /**
   * Local RAG search scoped to specific projects and/or files.
   *
   * Works identically to `ragSearch` but accepts optional `project_ids` and
   * `file_ids` filters for project/file-scoped context retrieval.
   */
  async localRagSearch(
    request: LocalRAGSearchRequest
  ): Promise<LocalRAGSearchResponse> {
    return this.retryableRequest<LocalRAGSearchResponse>(
      `${this.baseUrl}${aiMicroserviceEndpoints.localRagSearch}`,
      { method: "POST", body: JSON.stringify(request) }
    );
  }

  // ─── File Processing ─────────────────────────────────────────────────────────

  /**
   * Process a single file — extracts text, generates chunks & embeddings.
   *
   * Accepts a `File` or `Blob` and sends it as multipart/form-data.
   * The backend should store the returned chunks/embeddings in the database.
   */
  async processFile(
    file: File | Blob,
    fileName?: string
  ): Promise<FileProcessingResult> {
    const formData = new FormData();
    formData.append("file", file, fileName ?? (file as File).name ?? "upload");

    try {
      const response = await fetch(
        `${this.baseUrl}${aiMicroserviceEndpoints.processFile}`,
        {
          method: "POST",
          body: formData,
          signal: AbortSignal.timeout(this.fileProcessingTimeout),
        }
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new AIMicroserviceFileProcessingError(
          (errorBody as Record<string, string>).message ??
            `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      return (await response.json()) as FileProcessingResult;
    } catch (error) {
      if (error instanceof AIMicroserviceError) {
        throw error;
      }
      if (error instanceof DOMException && error.name === "TimeoutError") {
        throw new AIMicroserviceTimeoutError(this.fileProcessingTimeout);
      }
      throw new AIMicroserviceConnectionError(
        "File processing connection failed",
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Process multiple files in a single request (batch).
   *
   * Each file is appended to the multipart form under the key "files".
   */
  async processFiles(
    files: Array<File | Blob>,
    fileNames?: string[]
  ): Promise<BatchFileProcessingResponse> {
    const formData = new FormData();
    for (const [index, file] of files.entries()) {
      const name =
        fileNames?.at(index) ?? (file as File).name ?? `file-${index}`;
      formData.append("files", file, name);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}${aiMicroserviceEndpoints.processFiles}`,
        {
          method: "POST",
          body: formData,
          signal: AbortSignal.timeout(this.fileProcessingTimeout),
        }
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new AIMicroserviceFileProcessingError(
          (errorBody as Record<string, string>).message ??
            `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      return (await response.json()) as BatchFileProcessingResponse;
    } catch (error) {
      if (error instanceof AIMicroserviceError) {
        throw error;
      }
      if (error instanceof DOMException && error.name === "TimeoutError") {
        throw new AIMicroserviceTimeoutError(this.fileProcessingTimeout);
      }
      throw new AIMicroserviceConnectionError(
        "Batch file processing connection failed",
        error instanceof Error ? error : undefined
      );
    }
  }

  // ─── Embeddings ──────────────────────────────────────────────────────────────

  async embedMany(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    return this.retryableRequest<EmbeddingResponse>(
      `${this.baseUrl}${aiMicroserviceEndpoints.embeddings}`,
      { method: "POST", body: JSON.stringify(request) }
    );
  }

  async embedOne(
    text: string,
    taskType?: EmbeddingRequest["taskType"],
    outputDimensionality?: number
  ): Promise<number[]> {
    const result = await this.embedMany({
      texts: [text],
      taskType,
      outputDimensionality,
    });
    return result.embeddings[0];
  }

  // ─── OCR ─────────────────────────────────────────────────────────────────────

  async performOcr(request: OcrRequest): Promise<OcrResponse> {
    return this.retryableRequest<OcrResponse>(
      `${this.baseUrl}${aiMicroserviceEndpoints.ocr}`,
      { method: "POST", body: JSON.stringify(request) }
    );
  }

  // ─── Column Mappings / Row-to-Sentence ───────────────────────────────────────

  async generateColumnMappings(
    request: GenerateColumnMappingsRequest
  ): Promise<Record<string, string>> {
    const result = await this.retryableRequest<GenerateColumnMappingsResponse>(
      `${this.baseUrl}${aiMicroserviceEndpoints.columnMappings}`,
      { method: "POST", body: JSON.stringify(request) }
    );
    return result.mappings;
  }

  async convertRowToSentence(
    request: ConvertRowToSentenceRequest
  ): Promise<string> {
    const result = await this.retryableRequest<ConvertRowToSentenceResponse>(
      `${this.baseUrl}${aiMicroserviceEndpoints.rowToSentence}`,
      { method: "POST", body: JSON.stringify(request) }
    );
    return result.sentence;
  }

  // ─── Text Generation ─────────────────────────────────────────────────────────

  async generateText(request: TextGenerationRequest): Promise<string> {
    const response = await this.retryableRequest<{ text: string }>(
      `${this.baseUrl}${aiMicroserviceEndpoints.generateText}`,
      { method: "POST", body: JSON.stringify(request) }
    );
    return response.text;
  }

  // ─── Internal helpers ────────────────────────────────────────────────────────

  private async retryableRequest<T>(
    url: string,
    options: RequestInit
  ): Promise<T> {
    let lastError: Error = new AIMicroserviceError("Request failed");

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          signal: AbortSignal.timeout(this.timeout),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new AIMicroserviceError(
            (errorBody as Record<string, string>).message ??
              `HTTP ${response.status}: ${response.statusText}`,
            response.status
          );
        }

        return (await response.json()) as T;
      } catch (error) {
        if (error instanceof DOMException && error.name === "TimeoutError") {
          lastError = new AIMicroserviceTimeoutError(this.timeout);
        } else if (error instanceof AIMicroserviceError) {
          // Don't retry 4xx client errors
          if (
            error.statusCode &&
            error.statusCode >= 400 &&
            error.statusCode < 500
          ) {
            throw error;
          }
          lastError = error;
        } else {
          lastError = new AIMicroserviceConnectionError(
            `Request to ${url} failed`,
            error instanceof Error ? error : undefined
          );
        }

        if (attempt < this.maxRetries - 1) {
          const delay = 2 ** attempt * 1000;
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

/** Singleton instance — import this for most use cases */
export const aiMicroserviceClient = new AIMicroserviceClient();
