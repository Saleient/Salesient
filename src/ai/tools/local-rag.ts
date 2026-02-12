import { tool } from "ai";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { documentChunk, fileUpload, folder } from "@/db/schema";
import { generateEmbedding } from "@/lib/embeddings";

/**
 * Local RAG Tool - Semantic search over specific projects/files
 * Allows focused search within user-attached documents
 */

export const createLocalRAGTool = (authUserId: string) =>
  tool({
    description:
      "Perform semantic search over specific attached projects and/or files. This provides focused search within the documents the user has explicitly attached to the conversation, giving priority to their local context.",
    inputSchema: z.object({
      query: z
        .string()
        .describe("Search query - ask in natural language for best results"),
      projectIds: z
        .array(z.string())
        .optional()
        .nullable()
        .describe(
          "Array of project IDs to search within. If provided, will search all files in these projects."
        ),
      fileIds: z
        .array(z.string())
        .optional()
        .nullable()
        .describe("Array of specific file IDs to search within."),
      topK: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10)
        .describe("Number of documents to retrieve (default: 10, max: 50)"),
      minSimilarity: z
        .number()
        .min(0)
        .max(1)
        .default(0.4)
        .describe(
          "Minimum similarity score (0-1, default: 0.4 - lower threshold for local files)"
        ),
    }),
    execute: async ({
      query,
      projectIds: rawProjectIds,
      fileIds: rawFileIds,
      topK = 10,
      minSimilarity = 0.4,
    }: {
      query: string;
      projectIds?: string[] | null;
      fileIds?: string[] | null;
      topK?: number;
      minSimilarity?: number;
    }) => {
      const userId = authUserId;
      try {
        const projectIds = rawProjectIds || [];
        const fileIds = rawFileIds || [];

        console.log("🔍 LOCAL_RAG_SEARCH called with:", {
          userId,
          query: query.substring(0, 100),
          projectIds,
          fileIds,
          topK,
          minSimilarity,
        });
        console.log("📋 RAG Input Details:", {
          projectIdsCount: projectIds.length,
          fileIdsCount: fileIds.length,
          actualProjectIds: projectIds,
          actualFileIds: fileIds,
        });

        // Validate input - need at least one project or file ID
        if (projectIds.length === 0 && fileIds.length === 0) {
          console.log("❌ No project or file IDs provided");
          return {
            success: false,
            error:
              "Must provide at least one project ID or file ID for local search",
            retrievedCount: 0,
            chunks: [],
          };
        }

        // Generate embedding for the query
        const queryEmbedding = await generateEmbedding(query);

        // Build file IDs array - include direct file IDs and files from projects
        let allFileIds = [...fileIds];

        if (projectIds.length > 0) {
          console.log("📁 Searching for files in projects:", projectIds);
          // Get all files in the specified projects
          const projectFiles = await db
            .select({ id: fileUpload.id })
            .from(fileUpload)
            .where(
              and(
                eq(fileUpload.userId, userId),
                inArray(fileUpload.folderId, projectIds)
              )
            );

          console.log(
            "📄 Found project files:",
            projectFiles.map((f) => f.id)
          );
          allFileIds.push(...projectFiles.map((f) => f.id));
        }

        // Remove duplicates
        allFileIds = [...new Set(allFileIds)];
        console.log("📋 All file IDs to search:", allFileIds);

        if (allFileIds.length === 0) {
          console.log("⚠️ No files found for search");
          return {
            success: true,
            context: "No files found in the specified projects/files.",
            retrievedCount: 0,
            chunks: [],
            message: "No files found in attached projects",
          };
        }

        // Debug: Check if chunks exist for these files at all
        const chunkCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(documentChunk)
          .where(
            and(
              eq(documentChunk.userId, userId),
              inArray(documentChunk.fileId, allFileIds)
            )
          );
        console.log(
          `📊 Total chunks found in DB for files ${allFileIds.join(", ")}: ${
            chunkCount[0]?.count
          }`
        );

        // Vector search using pgvector cosine similarity within specific files
        console.log("🔍 Running vector search on files:", allFileIds); // Format embedding as string for pgvector
        const vectorString = `[${queryEmbedding.join(",")}]`;

        const similarChunks = await db
          .select({
            id: documentChunk.id,
            content: documentChunk.content,
            metadata: documentChunk.metadata,
            fileId: documentChunk.fileId,
            similarity:
              sql<number>`1 - (${documentChunk.embedding} <=> ${vectorString}::vector)`.as(
                "similarity"
              ),
          })
          .from(documentChunk)
          .where(
            and(
              eq(documentChunk.userId, userId),
              inArray(documentChunk.fileId, allFileIds)
            )
          )
          .orderBy(sql`${documentChunk.embedding} <=> ${vectorString}::vector`)
          .limit(topK);

        console.log(
          `📊 Found ${similarChunks.length} chunks from vector search`
        );

        // Filter by minimum similarity
        const filtered = similarChunks.filter(
          (chunk) => chunk.similarity >= minSimilarity
        );

        console.log(
          `✅ Filtered to ${filtered.length} chunks above ${minSimilarity} similarity`
        );

        if (filtered.length === 0) {
          console.log("❌ No relevant content found");
          return {
            success: true,
            context:
              "No relevant content found in the attached files for your query.",
            retrievedCount: 0,
            chunks: [],
            message: `No relevant content found in attached files (searched ${allFileIds.length} files)`,
          };
        }

        // Get file names for better context
        const fileNames = await db
          .select({
            id: fileUpload.id,
            fileName: fileUpload.fileName,
            folderId: fileUpload.folderId,
          })
          .from(fileUpload)
          .where(inArray(fileUpload.id, allFileIds));

        // Get project names for files in projects
        const projectNames =
          projectIds.length > 0
            ? await db
                .select({
                  id: folder.id,
                  name: folder.name,
                })
                .from(folder)
                .where(inArray(folder.id, projectIds))
            : [];

        const fileNameMap = new Map(fileNames.map((f) => [f.id, f.fileName]));
        const projectNameMap = new Map(projectNames.map((p) => [p.id, p.name]));

        // Create project lookup for files
        const fileToProjectMap = new Map(
          fileNames.filter((f) => f.folderId).map((f) => [f.id, f.folderId!])
        );

        // Prepare context for LLM with enhanced local context emphasis
        const context = filtered
          .map((chunk, idx) => {
            const _meta = chunk.metadata as Record<string, unknown>;
            const fileName = fileNameMap.get(chunk.fileId) || "Unknown File";
            const projectId = fileToProjectMap.get(chunk.fileId);
            const projectName = projectId
              ? projectNameMap.get(projectId)
              : null;

            let sourceInfo = `📄 ${fileName}`;
            if (projectName) {
              sourceInfo = `📁 ${projectName}/${fileName}`;
            }

            return `[${idx + 1}] ${chunk.content}\n📍 Source: ${sourceInfo}`;
          })
          .join("\n\n");

        return {
          success: true,
          context: `🔥 **ATTACHED DOCUMENT CONTENT** 🔥
📂 **Source**: User's uploaded files (${allFileIds.length} files searched)
🎯 **Relevance**: ${filtered.length} highly relevant sections found

📖 **DOCUMENT ANALYSIS**:
${context}

🚨 **IMPORTANT**: This content comes directly from the user's attached documents. Reference specific details and file names in your response to show you've read their materials.`,
          retrievedCount: filtered.length,
          chunks: filtered.map((chunk) => {
            const fileName = fileNameMap.get(chunk.fileId) || "Unknown File";
            const projectId = fileToProjectMap.get(chunk.fileId);
            const projectName = projectId
              ? projectNameMap.get(projectId)
              : null;

            const metadataObj =
              typeof chunk.metadata === "object" && chunk.metadata !== null
                ? (chunk.metadata as Record<string, unknown>)
                : {};

            return {
              id: chunk.id,
              chunk: chunk.content.substring(0, 300),
              similarity: Number((chunk.similarity * 100).toFixed(1)),
              metadata: {
                ...metadataObj,
                fileName,
                projectName,
                source: projectName ? `${projectName}/${fileName}` : fileName,
              },
            };
          }),
          message: `🎯 Successfully analyzed attached documents: Found ${filtered.length} relevant sections from ${allFileIds.length} files`,
          searchScope: {
            totalFiles: allFileIds.length,
            projects: projectIds.length,
            files: fileIds.length,
          },
        };
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Local RAG search failed";
        console.error("❌ Local RAG search error:", error);
        if (error instanceof Error && error.stack) {
          console.error("Stack trace:", error.stack);
        }
        return {
          success: false,
          error: errorMsg,
          retrievedCount: 0,
          chunks: [],
        };
      }
    },
  });
