import { tool } from "ai";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { documentChunk } from "@/db/schema";
import { generateEmbedding } from "@/lib/embeddings";

/**
 * RAG (Retrieval Augmented Generation) Tool
 * Semantic search over indexed documents using pgvector
 */

export const RAGTool = tool({
  description:
    "Perform semantic search over your indexed documents using vector similarity. Retrieves the most relevant documents based on meaning, not keywords.",
  inputSchema: z.object({
    userId: z.string().describe("The user ID"),
    query: z
      .string()
      .describe("Search query - ask in natural language for best results"),
    topK: z
      .number()
      .int()
      .min(1)
      .max(50)
      .default(5)
      .describe("Number of documents to retrieve (default: 5, max: 50)"),
    minSimilarity: z
      .number()
      .min(0)
      .max(1)
      .default(0.5)
      .describe("Minimum similarity score (0-1, default: 0.5)"),
  }),
  execute: async ({
    userId,
    query,
    topK = 5,
    minSimilarity = 0.5,
  }: {
    userId: string;
    query: string;
    topK?: number;
    minSimilarity?: number;
  }) => {
    try {
      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(query);

      // Vector search using pgvector cosine similarity
      // Uses <=> operator for cosine distance (smaller = more similar)
      // cosine_distance = 1 - cosine_similarity, so we convert back
      const similarChunks = await db
        .select({
          id: documentChunk.id,
          content: documentChunk.content,
          metadata: documentChunk.metadata,
          similarity: sql<number>`
            (1 - (${documentChunk.embedding} <=> ${queryEmbedding}::vector)) AS similarity
          `.as("similarity"),
        })
        .from(documentChunk)
        .where(sql`${documentChunk.userId} = ${userId}`)
        .orderBy(sql`${documentChunk.embedding} <=> ${queryEmbedding}::vector`)
        .limit(topK);

      // Filter by minimum similarity
      const filtered = similarChunks.filter(
        (chunk) => chunk.similarity >= minSimilarity
      );

      if (filtered.length === 0) {
        return {
          success: true,
          context: "No documents found matching your query.",
          retrievedCount: 0,
          chunks: [],
          message:
            "No relevant documents found (try adjusting similarity threshold)",
        };
      }

      // Prepare context for LLM
      const context = filtered
        .map((chunk, idx) => {
          const meta = chunk.metadata as Record<string, unknown>;
          const source = meta?.source ? ` (Source: ${meta.source})` : "";
          return `[${idx + 1}] ${chunk.content}${source}`;
        })
        .join("\n\n");

      return {
        success: true,
        context: `Context retrieved from knowledge base:\n\n${context}`,
        retrievedCount: filtered.length,
        chunks: filtered.map((chunk) => ({
          id: chunk.id,
          chunk: chunk.content.substring(0, 200),
          similarity: Number((chunk.similarity * 100).toFixed(1)),
          metadata: chunk.metadata,
        })),
        message: `Found ${filtered.length} relevant documents`,
      };
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "RAG search failed";
      console.error("RAG search error:", error);
      return {
        success: false,
        error: errorMsg,
        retrievedCount: 0,
        chunks: [],
      };
    }
  },
});
