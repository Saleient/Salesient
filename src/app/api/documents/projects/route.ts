import { NextResponse } from "next/server";
import { createFolder, listFolders } from "@/queries/files";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = body?.name;
    if (!name) {
      return new NextResponse("Missing name", { status: 400 });
    }
    const folder = await createFolder(name);
    return NextResponse.json(folder);
  } catch (error) {
    console.error("/api/documents/projects POST error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const folders = await listFolders();
    return NextResponse.json(folders);
  } catch (error) {
    console.error("/api/documents/projects GET error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
