import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { fileUpload } from "@/db/schema";
import { auth } from "@/lib/auth";
import { downloadFromMinIO } from "@/lib/minio";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { fileId } = await params;

    // Get file metadata from database
    const [file] = await db
      .select()
      .from(fileUpload)
      .where(eq(fileUpload.id, fileId))
      .limit(1);

    if (!file) {
      return new Response("File not found", { status: 404 });
    }

    // Verify user has access (file owner or shared access)
    if (file.userId !== session.user.id) {
      // TODO: Add logic to check if file is in a shared folder
      return new Response("Forbidden", { status: 403 });
    }

    // Download file from R2
    const buffer = await downloadFromMinIO(file.filePath);

    // Convert Buffer to Uint8Array for Response
    const uint8Array = new Uint8Array(buffer);

    // Return file with appropriate headers
    return new Response(uint8Array, {
      headers: {
        "Content-Type": file.fileType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${file.fileName}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
