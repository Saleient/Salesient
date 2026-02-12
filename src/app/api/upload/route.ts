import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { uploadFile } from "@/queries/files";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderId = formData.get("folderId") as string | null;

    if (!file) {
      return new Response("No file provided", { status: 400 });
    }

    // Check file size (10MB limit for API routes)
    if (file.size > 10 * 1024 * 1024) {
      return new Response("File too large (max 10MB)", { status: 413 });
    }

    const uploadedFile = await uploadFile(file, folderId || undefined);

    return Response.json({
      success: true,
      file: {
        id: uploadedFile.id,
        fileName: uploadedFile.fileName,
        fileType: uploadedFile.fileType,
        createdAt: uploadedFile.createdAt,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to upload file";

    return Response.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds for file processing
