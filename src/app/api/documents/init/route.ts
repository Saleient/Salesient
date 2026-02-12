import { NextResponse } from "next/server";
import { listFiles, listFolders } from "@/queries/files";

export async function GET() {
  try {
    const [folders, files] = await Promise.all([listFolders(), listFiles()]);
    return NextResponse.json({ projects: folders, rootFiles: files });
  } catch (error) {
    console.error("/api/documents/init error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
