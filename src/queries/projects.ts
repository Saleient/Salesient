"use server";
import { generateId } from "ai";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { fileUpload, folder } from "@/db/schema";

// Project (Folder) queries
export async function getProjects(userId: string) {
  return await db.select().from(folder).where(eq(folder.userId, userId));
}

// Lightweight version for SearchPanel - only return essential fields
export async function getProjectsForSearch(userId: string) {
  return await db
    .select({
      id: folder.id,
      name: folder.name,
      createdAt: folder.createdAt,
    })
    .from(folder)
    .where(eq(folder.userId, userId));
}

export async function getProject(projectId: string, userId: string) {
  return await db
    .select()
    .from(folder)
    .where(and(eq(folder.id, projectId), eq(folder.userId, userId)))
    .then((rows) => rows[0] || null);
}

export async function createProject(userId: string, name: string) {
  const id = generateId();
  await db.insert(folder).values({
    id,
    userId,
    name,
  });
  return {
    id,
    userId,
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function updateProject(
  projectId: string,
  userId: string,
  name: string
) {
  await db
    .update(folder)
    .set({ name, updatedAt: new Date() })
    .where(and(eq(folder.id, projectId), eq(folder.userId, userId)));
  return { success: true };
}

export async function deleteProject(projectId: string, userId: string) {
  await db
    .delete(folder)
    .where(and(eq(folder.id, projectId), eq(folder.userId, userId)));
  return { success: true };
}

// File queries
export async function getRootFiles(userId: string) {
  return await db
    .select()
    .from(fileUpload)
    .where(and(eq(fileUpload.userId, userId), isNull(fileUpload.folderId)))
    .catch(() => []);
}

// Lightweight version for SearchPanel - only return essential fields (no embeddings/large data)
export async function getRootFilesForSearch(userId: string) {
  return await db
    .select({
      id: fileUpload.id,
      fileName: fileUpload.fileName,
      fileType: fileUpload.fileType,
      integrationName: fileUpload.integrationName,
      integrationLogo: fileUpload.integrationLogo,
      createdAt: fileUpload.createdAt,
      folderId: fileUpload.folderId,
    })
    .from(fileUpload)
    .where(and(eq(fileUpload.userId, userId), isNull(fileUpload.folderId)))
    .catch(() => []);
}

export async function getProjectFiles(projectId: string, userId: string) {
  return await db
    .select()
    .from(fileUpload)
    .where(
      and(eq(fileUpload.userId, userId), eq(fileUpload.folderId, projectId))
    )
    .catch(() => []);
}

export async function uploadFile({
  userId,
  fileName,
  fileType,
  filePath,
  embedding,
  folderId,
}: {
  userId: string;
  fileName: string;
  fileType: string;
  filePath: string;
  embedding: number[];
  folderId?: string;
}) {
  const id = generateId();
  await db.insert(fileUpload).values({
    id,
    userId,
    fileName,
    fileType,
    filePath,
    folderId: folderId || null,
  });
  return {
    id,
    userId,
    fileName,
    fileType,
    filePath,
    embedding,
    folderId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function deleteFile(fileId: string, userId: string) {
  await db
    .delete(fileUpload)
    .where(and(eq(fileUpload.id, fileId), eq(fileUpload.userId, userId)));
  return { success: true };
}
