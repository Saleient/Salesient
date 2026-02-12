"use server";

import { generateId } from "ai";
import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  documentChunk,
  type FileUpload,
  fileUpload,
  folder,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { chunkText, generateEmbeddings } from "@/lib/embeddings";
import {
  getFileCategory,
  isValidFileType,
  processFile,
} from "@/lib/file-processing";
import {
  deleteFromMinIO,
  downloadFromMinIO,
  getPresignedURL,
  uploadToMinIO,
} from "@/lib/minio";

/**
 * File management server actions for upload, download, list, delete
 * Integrates with Cloudflare R2 for storage and embeddings for RAG
 */

type FileLike = {
  arrayBuffer(): Promise<ArrayBuffer>;
  name: string;
  type: string;
};

/**
 * Upload a file to Cloudflare R2 and create database record
 */
export async function uploadFile(
  file: FileLike,
  folderId?: string
): Promise<FileUpload> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const fileType = file.type;

    // Validate file type
    if (!isValidFileType(fileName)) {
      throw new Error(
        "Unsupported file type. Supported: PDF, DOCX, PPTX, XLSX, CSV, TXT, MD"
      );
    }

    // Upload to Cloudflare R2
    const objectKey = `${userId}/files/${generateId()}/${fileName}`;
    try {
      await uploadToMinIO(objectKey, buffer, {
        "original-name": fileName,
        "user-id": userId,
      });
    } catch (storageError) {
      console.error("R2 upload failed:", storageError);
      throw new Error(
        `Storage service error: ${
          storageError instanceof Error
            ? storageError.message
            : "R2 upload failed"
        }`
      );
    }

    // Process file and extract text
    try {
      console.log(`Processing ${fileName} (${getFileCategory(fileName)})...`);
      const processed = await processFile(buffer, fileName, fileType);

      // Chunk the extracted text
      const chunks = chunkText(processed.text, 1024, 256);
      const chunkTexts = chunks.map((c) => c.content);

      // Generate embeddings for chunks (batch)
      let embeddings: number[][] = [];
      try {
        embeddings = await generateEmbeddings(chunkTexts);
      } catch (embeddingError) {
        console.warn("Failed to generate embeddings:", embeddingError);
      }

      // Create database record for file
      const [newFile] = await db
        .insert(fileUpload)
        .values({
          userId,
          folderId: folderId || null,
          fileName,
          fileType,
          filePath: objectKey,
          extractedText: processed.text,
        })
        .returning();

      // Store chunks with embeddings in document_chunk table
      if (embeddings.length > 0) {
        const chunkRecords: (typeof documentChunk.$inferInsert)[] = chunks.map(
          (chunk, idx) => ({
            fileId: newFile.id,
            userId,
            content: chunk.content,
            embedding: embeddings[idx] || [],
            metadata: {
              source: fileName,
              startIdx: chunk.startIdx,
              endIdx: chunk.endIdx,
              ...processed.metadata,
            },
          })
        );

        await db.insert(documentChunk).values(chunkRecords);
      }

      return newFile;
    } catch (processingError) {
      console.error("File processing failed:", processingError);
      // Create file record even if processing failed
      const [newFile] = await db
        .insert(fileUpload)
        .values({
          userId,
          folderId: folderId || null,
          fileName,
          fileType,
          filePath: objectKey,
        })
        .returning();
      return newFile;
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

/**
 * List files in a folder or root
 */
export async function listFiles(folderId?: string): Promise<FileUpload[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    if (folderId) {
      return await db
        .select()
        .from(fileUpload)
        .where(
          and(eq(fileUpload.userId, userId), eq(fileUpload.folderId, folderId))
        );
    }
    return await db
      .select()
      .from(fileUpload)
      .where(and(eq(fileUpload.userId, userId), isNull(fileUpload.folderId)));
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
}

/**
 * Get a single file
 */
export async function getFile(fileId: string): Promise<FileUpload | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const result = await db
      .select()
      .from(fileUpload)
      .where(and(eq(fileUpload.id, fileId), eq(fileUpload.userId, userId)))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching file:", error);
    throw error;
  }
}

/**
 * Download file content
 */
export async function downloadFile(fileId: string): Promise<Buffer> {
  try {
    const file = await getFile(fileId);
    if (!file) {
      throw new Error("File not found or unauthorized");
    }

    return await downloadFromMinIO(file.filePath);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

/**
 * Get presigned download URL for file
 */
export async function getDownloadURL(
  fileId: string,
  expirySeconds?: number
): Promise<string> {
  try {
    const file = await getFile(fileId);
    if (!file) {
      throw new Error("File not found or unauthorized");
    }

    return await getPresignedURL(file.filePath, expirySeconds);
  } catch (error) {
    console.error("Error generating download URL:", error);
    throw error;
  }
}

/**
 * Delete a file
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // Verify ownership
    const file = await getFile(fileId);
    if (!file || file.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Delete from Cloudflare R2
    await deleteFromMinIO(file.filePath);

    // Delete from database
    await db.delete(fileUpload).where(eq(fileUpload.id, fileId));

    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

/**
 * Move a file to a different folder (or root when folderId is null)
 */
export async function moveFile(
  fileId: string,
  folderId?: string | null
): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    const userId = session.user.id;

    // Verify file ownership
    const file = await getFile(fileId);
    if (!file || file.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // If moving into a folder, verify folder ownership
    if (folderId) {
      const targetFolder = await db
        .select()
        .from(folder)
        .where(and(eq(folder.id, folderId), eq(folder.userId, userId)))
        .limit(1);
      if (!targetFolder[0]) {
        throw new Error("Target folder not found or unauthorized");
      }
    }

    // If folderId unchanged, no-op
    const currentFolderId = file.folderId || null;
    const nextFolderId = folderId || null;
    if (currentFolderId === nextFolderId) {
      return true;
    }

    await db
      .update(fileUpload)
      .set({ folderId: nextFolderId })
      .where(eq(fileUpload.id, fileId));

    return true;
  } catch (error) {
    console.error("Error moving file:", error);
    throw error;
  }
}

/**
 * Create a folder
 */
export async function createFolder(
  name: string
): Promise<typeof folder.$inferSelect> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const [newFolder] = await db
      .insert(folder)
      .values({
        userId,
        name,
      })
      .returning();

    return newFolder;
  } catch (error) {
    console.error("Error creating folder:", error);
    throw error;
  }
}

/**
 * List folders for user
 */
export async function listFolders(): Promise<(typeof folder.$inferSelect)[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    return await db.select().from(folder).where(eq(folder.userId, userId));
  } catch (error) {
    console.error("Error listing folders:", error);
    throw error;
  }
}

/**
 * Delete a folder (cascade deletes files)
 */
export async function deleteFolder(folderId: string): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // Verify ownership
    const folderRecord = await db
      .select()
      .from(folder)
      .where(and(eq(folder.id, folderId), eq(folder.userId, userId)))
      .limit(1);

    if (!folderRecord[0]) {
      throw new Error("Folder not found or unauthorized");
    }

    // Delete all files in folder from R2
    const files = await db
      .select()
      .from(fileUpload)
      .where(eq(fileUpload.folderId, folderId));

    for (const file of files) {
      try {
        await deleteFromMinIO(file.filePath);
        // Cascade delete chunks handled by database
      } catch (error) {
        console.warn(`Failed to delete file from R2: ${file.filePath}`, error);
      }
    }

    // Delete folder (cascade will delete files in DB)
    await db.delete(folder).where(eq(folder.id, folderId));

    return true;
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw error;
  }
}
