import { tool } from "ai";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { documentChunk, fileUpload, folder, user } from "@/db/schema";
import { chunkText, generateEmbeddings } from "@/lib/embeddings";
import { processFile } from "@/lib/file-processing";
import { uploadToMinIO } from "@/lib/minio";

/**
 * Universal File Processor for Composio Integrations
 *
 * This tool handles files from any Composio integration that supports
 * file download but not direct reading (e.g., OneDrive, Google Drive, Dropbox, etc.)
 *
 * Process Flow:
 * 1. Download file as buffer using Composio action
 * 2. Upload buffer to R2 storage
 * 3. Process file content (extract text)
 * 4. Generate embeddings for semantic search
 * 5. Store chunks in database for RAG queries
 */

export const ComposioFileProcessor = tool({
  description: `Process and index file data from Composio integrations. This tool takes the response from a Composio download action 
(like ONEDRIVE_DOWNLOAD_FILE) and processes the file - uploading to storage, extracting text, generating embeddings, 
and making it searchable through RAG.

IMPORTANT: This tool expects to receive the 'data' object from a Composio download action response. 
The AI should first call the integration's download action (via MCP tools), then pass the result to this tool.`,

  inputSchema: z.object({
    downloadResponse: z
      .any()
      .describe(
        "The complete response from the Composio download action, including the 'data' object with file content"
      ),
    integrationName: z
      .string()
      .describe(
        "The name of the source integration (e.g., 'onedrive', 'googledrive', 'dropbox')"
      ),
    fileName: z
      .string()
      .describe(
        "The name of the file including extension (e.g., 'document.pdf', 'report.docx')"
      ),
    userId: z.string().describe("The user ID of the user processing the file"),
    folderId: z
      .string()
      .optional()
      .describe("Optional folder ID to organize the file in the database"),
  }),

  execute: async ({
    downloadResponse,
    integrationName,
    fileName,
    userId,
    folderId,
  }) => {
    try {
      console.log(
        `Processing file ${fileName} from ${integrationName} for user ${userId}`
      );

      // Validate that the user exists in the database
      const existingUser = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (existingUser.length === 0) {
        throw new Error(
          `User with ID ${userId} not found in database. Please ensure you are logged in with a valid account.`
        );
      }

      // Validate folderId if provided
      if (folderId) {
        const existingFolder = await db
          .select({ id: folder.id })
          .from(folder)
          .where(eq(folder.id, folderId))
          .limit(1);

        if (existingFolder.length === 0) {
          throw new Error(`Folder with ID ${folderId} not found in database.`);
        }
      }

      // Check for duplicate files from the same integration
      const existingFile = await db
        .select({ id: fileUpload.id })
        .from(fileUpload)
        .where(
          and(
            eq(fileUpload.userId, userId),
            eq(fileUpload.fileName, fileName),
            eq(fileUpload.integrationName, integrationName)
          )
        )
        .limit(1);

      if (existingFile.length > 0) {
        throw new Error(
          `File "${fileName}" from integration "${integrationName}" already exists for this user. Skipping duplicate processing.`
        );
      }

      // Step 1: Extract file buffer from Composio download response
      // Check if download was successful
      if (downloadResponse?.successful === false) {
        throw new Error(
          downloadResponse?.error || "Download failed from integration"
        );
      }

      const responseData = downloadResponse?.data || downloadResponse;
      let fileBuffer: Buffer | undefined;

      // Try multiple extraction strategies based on common patterns
      if (Buffer.isBuffer(responseData)) {
        // Direct buffer
        fileBuffer = responseData;
      } else if (typeof responseData === "string") {
        // Base64 encoded string
        fileBuffer = Buffer.from(responseData, "base64");
      } else if (responseData && typeof responseData === "object") {
        // Object with various possible structures
        if (Buffer.isBuffer(responseData.content)) {
          fileBuffer = responseData.content;
        } else if (typeof responseData.content === "string") {
          // Base64 in content field
          fileBuffer = Buffer.from(responseData.content, "base64");
        } else if (typeof responseData.data === "string") {
          // Base64 in nested data field
          fileBuffer = Buffer.from(responseData.data, "base64");
        } else if (Buffer.isBuffer(responseData.data)) {
          // Buffer in nested data field
          fileBuffer = responseData.data;
        } else if (responseData.file) {
          // Some integrations use 'file' field
          if (Buffer.isBuffer(responseData.file)) {
            fileBuffer = responseData.file;
          } else if (typeof responseData.file === "string") {
            fileBuffer = Buffer.from(responseData.file, "base64");
          } else {
            throw new Error(
              `Unable to extract file from 'file' field for ${integrationName}`
            );
          }
        } else if (responseData.bytes) {
          // Some integrations use 'bytes' field
          if (Buffer.isBuffer(responseData.bytes)) {
            fileBuffer = responseData.bytes;
          } else if (Array.isArray(responseData.bytes)) {
            fileBuffer = Buffer.from(responseData.bytes);
          } else if (typeof responseData.bytes === "string") {
            fileBuffer = Buffer.from(responseData.bytes, "base64");
          } else {
            throw new Error(
              `Unable to extract file from 'bytes' field for ${integrationName}`
            );
          }
        } else if (responseData.s3url) {
          // Some integrations provide an S3 URL to download from
          if (typeof responseData.s3url === "string") {
            try {
              const response = await fetch(responseData.s3url);
              if (!response.ok) {
                throw new Error(
                  `Failed to fetch from S3 URL: ${response.status}`
                );
              }
              const arrayBuffer = await response.arrayBuffer();
              fileBuffer = Buffer.from(arrayBuffer);
            } catch (fetchError) {
              throw new Error(
                `Unable to download file from S3 URL for ${integrationName}: ${fetchError instanceof Error ? fetchError.message : "Unknown error"}`
              );
            }
          } else {
            throw new Error(
              `Invalid s3url field type for ${integrationName}: expected string, got ${typeof responseData.s3url}`
            );
          }
        } else if (
          responseData.content &&
          typeof responseData.content === "object" &&
          typeof responseData.content.s3url === "string"
        ) {
          // Handle nested content object with s3url (e.g., OneDrive)
          try {
            const response = await fetch(responseData.content.s3url);
            if (!response.ok) {
              throw new Error(
                `Failed to fetch from S3 URL: ${response.status}`
              );
            }
            const arrayBuffer = await response.arrayBuffer();
            fileBuffer = Buffer.from(arrayBuffer);
          } catch (fetchError) {
            throw new Error(
              `Unable to download file from S3 URL for ${integrationName}: ${fetchError instanceof Error ? fetchError.message : "Unknown error"}`
            );
          }
        } else {
          // Log the response structure to help debug
          console.error(
            "Unknown download response structure:",
            JSON.stringify(responseData, null, 2).substring(0, 500)
          );
          throw new Error(
            `Unsupported download response format from ${integrationName}. Data object keys: ${Object.keys(responseData).join(", ")}`
          );
        }
      }
      if (!fileBuffer) {
        throw new Error(
          `Unable to extract file buffer from ${integrationName} download response. Response type: ${typeof responseData}`
        );
      }

      console.log(
        `Downloaded file: ${fileName}, size: ${fileBuffer.length} bytes`
      );

      // Step 2: Upload to R2 storage
      const r2Path = `${userId}/files/${Date.now()}-${fileName}`;
      await uploadToMinIO(r2Path, fileBuffer, {
        originalName: fileName,
        source: integrationName,
        uploadedAt: new Date().toISOString(),
        userId,
      });

      console.log(`Uploaded to R2: ${r2Path}`);

      // Step 3: Process file to extract text
      const mimeType = getMimeTypeFromFileName(fileName);
      const processedDoc = await processFile(fileBuffer, fileName, mimeType);

      console.log(
        `Extracted text content: ${processedDoc.text.length} characters`
      );

      // Prepare additional fields
      let imageBase64: string | undefined;
      if (mimeType.startsWith("image/")) {
        imageBase64 = fileBuffer.toString("base64");
      }

      // Get integration logo as base64
      let integrationLogoBase64: string | null = null;
      if (integrationName) {
        try {
          const { getIntegrationLogoBase64 } = await import("@/lib/utils");
          integrationLogoBase64 =
            await getIntegrationLogoBase64(integrationName);
        } catch (error) {
          console.warn(
            `Failed to fetch logo for integration ${integrationName}:`,
            error
          );
        }
      } // Step 4: Create file record in database
      const [fileRecord] = await db
        .insert(fileUpload)
        .values({
          userId,
          folderId: folderId || null,
          fileName,
          fileType: processedDoc.metadata.fileType,
          filePath: r2Path,
          integrationName,
          integrationLogo: integrationLogoBase64,
          imageBase64,
          extractedText: processedDoc.text,
        })
        .returning();

      console.log(`Created file record: ${fileRecord.id}`);

      // Step 5: Chunk text for embeddings
      const chunks = chunkText(processedDoc.text, 1024, 256);
      console.log(`Generated ${chunks.length} text chunks`);

      // Step 6: Generate embeddings for all chunks
      const chunkContents = chunks.map((c) => c.content);
      const embeddings = await generateEmbeddings(chunkContents);

      console.log(`Generated ${embeddings.length} embeddings`);

      // Step 7: Store chunks with embeddings in database
      const chunkRecords = chunks.map((chunk, index) => ({
        fileId: fileRecord.id,
        userId,
        content: chunk.content,
        embedding: embeddings[index],
        metadata: {
          startIdx: chunk.startIdx,
          endIdx: chunk.endIdx,
          chunkIndex: index,
          source: integrationName,
          fileName,
          ...processedDoc.metadata,
        },
      }));

      await db.insert(documentChunk).values(chunkRecords);

      console.log(`Stored ${chunkRecords.length} chunks in database`);

      return {
        success: true,
        fileId: fileRecord.id,
        fileName,
        fileType: processedDoc.metadata.fileType,
        r2Path,
        source: integrationName,
        textLength: processedDoc.text.length,
        chunkCount: chunks.length,
        embeddingDimension: embeddings[0]?.length || 0,
        message: `Successfully processed ${fileName} from ${integrationName}. Extracted ${processedDoc.text.length} characters, created ${chunks.length} searchable chunks, and indexed for RAG queries.`,
      };
    } catch (error) {
      console.error("Composio file processing error:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process file from integration",
        details: error,
      };
    }
  },
});

/**
 * Helper function to determine MIME type from file extension
 */
function getMimeTypeFromFileName(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();

  const mimeTypeMap: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ppt: "application/vnd.ms-powerpoint",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    csv: "text/csv",
    txt: "text/plain",
    md: "text/markdown",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };

  return mimeTypeMap[extension || ""] || "application/octet-stream";
}

/**
 * Query helper to search processed files using semantic search
 * This can be used in RAG contexts to retrieve relevant file content
 */
export async function queryComposioFiles(
  userId: string,
  queryText: string,
  topK = 5,
  minSimilarity = 0.5
): Promise<
  Array<{
    content: string;
    fileName: string;
    source: string;
    similarity: number;
    metadata: any;
  }>
> {
  const { generateEmbedding, cosineSimilarity } = await import(
    "@/lib/embeddings"
  );
  const { sql } = await import("drizzle-orm");

  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(queryText);

  // Retrieve all chunks for user (in production, use vector similarity search)
  const chunks = await db
    .select({
      id: documentChunk.id,
      content: documentChunk.content,
      embedding: documentChunk.embedding,
      metadata: documentChunk.metadata,
    })
    .from(documentChunk)
    .where(sql`${documentChunk.userId} = ${userId}`);

  // Calculate similarities
  const results = chunks
    .map((chunk) => {
      const similarity = cosineSimilarity(
        queryEmbedding,
        chunk.embedding as number[]
      );
      return {
        content: chunk.content,
        fileName: (chunk.metadata as any)?.fileName || "Unknown",
        source: (chunk.metadata as any)?.source || "Unknown",
        similarity,
        metadata: chunk.metadata,
      };
    })
    .filter((result) => result.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  return results;
}
