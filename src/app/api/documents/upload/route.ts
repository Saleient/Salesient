import { NextResponse } from "next/server";
import { uploadFile } from "@/queries/files";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const folderId = form.get("folderId") as string | null;
    if (!file) {
      return new NextResponse("Missing file", { status: 400 });
    }

    // The server-side uploadFile expects a File-like object with arrayBuffer(), name, type
    const uploaded = await uploadFile(file, folderId || undefined);
    return NextResponse.json(uploaded);
  } catch (error) {
    console.error("/api/documents/upload error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
