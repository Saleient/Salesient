import { aiMicroserviceClient } from "@/lib/ai-microservice";
import { serverEnv } from "@/env";

/**
 * Embeddings library using microservice for RAG
 * Supports chunking, similarity search, and vector storage
 */

const EMBEDDING_DIMENSION = serverEnv.EMBEDDINGS_DIMENSION;

/**
 * Generate embedding for text using microservice
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    return await aiMicroserviceClient.embedOne(
      text,
      "SEMANTIC_SIMILARITY",
      EMBEDDING_DIMENSION
    );
  } catch (error) {
    console.error("Failed to generate embedding:", error);
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts (batch)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const result = await aiMicroserviceClient.embedMany({
      texts,
      taskType: "SEMANTIC_SIMILARITY",
      outputDimensionality: EMBEDDING_DIMENSION,
    });
    return result.embeddings;
  } catch (error) {
    console.error("Failed to generate embeddings:", error);
    throw error;
  }
}

/**
 * Chunk text using recursive splitting strategy
 * Optimized for semantic coherence
 */
export function chunkText(
  text: string,
  chunkSize = 1024,
  overlap = 256
): Array<{
  content: string;
  startIdx: number;
  endIdx: number;
}> {
  const chunks: Array<{
    content: string;
    startIdx: number;
    endIdx: number;
  }> = [];

  // Split by paragraph first
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = "";
  let chunkStartIdx = 0;

  for (const paragraph of paragraphs) {
    const sentences = paragraph.split(/(?<=[.!?])\s+/);

    for (const sentence of sentences) {
      if (`${currentChunk} ${sentence}`.length <= chunkSize) {
        currentChunk += (currentChunk ? " " : "") + sentence;
      } else if (currentChunk) {
        chunks.push({
          content: currentChunk,
          startIdx: chunkStartIdx,
          endIdx: chunkStartIdx + currentChunk.length,
        });
        chunkStartIdx += currentChunk.length - overlap;
        currentChunk = sentence;
      } else {
        // Sentence longer than chunk size, split by words
        const words = sentence.split(" ");
        let wordChunk = "";
        for (const word of words) {
          if (`${wordChunk} ${word}`.length <= chunkSize) {
            wordChunk += (wordChunk ? " " : "") + word;
          } else {
            if (wordChunk) {
              chunks.push({
                content: wordChunk,
                startIdx: chunkStartIdx,
                endIdx: chunkStartIdx + wordChunk.length,
              });
              chunkStartIdx += wordChunk.length - overlap;
            }
            wordChunk = word;
          }
        }
        if (wordChunk) {
          currentChunk = wordChunk;
        }
      }
    }
  }

  if (currentChunk) {
    chunks.push({
      content: currentChunk,
      startIdx: chunkStartIdx,
      endIdx: chunkStartIdx + currentChunk.length,
    });
  }

  return chunks;
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Find most similar chunks to a query embedding
 */
export function findSimilarChunks(
  queryEmbedding: number[],
  chunkEmbeddings: Array<{
    chunk: string;
    embedding: number[];
    metadata?: Record<string, any>;
  }>,
  topK = 5,
  minSimilarity = 0.5
): Array<{
  chunk: string;
  similarity: number;
  metadata?: Record<string, any>;
}> {
  const similarities = chunkEmbeddings.map((item) => ({
    chunk: item.chunk,
    similarity: cosineSimilarity(queryEmbedding, item.embedding),
    metadata: item.metadata,
  }));

  return similarities
    .filter((item) => item.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Prepare RAG context from retrieved chunks
 */
export function prepareRAGContext(
  retrievedChunks: Array<{
    chunk: string;
    similarity: number;
    metadata?: Record<string, any>;
  }>
): string {
  const context = retrievedChunks
    .map((item, idx) => {
      const source = item.metadata?.source
        ? ` (Source: ${item.metadata.source})`
        : "";
      return `[${idx + 1}] ${item.chunk}${source}`;
    })
    .join("\n\n");

  return `Context retrieved from knowledge base:\n\n${context}`;
}
