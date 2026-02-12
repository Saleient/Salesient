import { NextResponse } from "next/server";
import { listFiles } from "@/queries/files";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }

    const files = await listFiles(id);
    return NextResponse.json(files);
  } catch (error) {
    console.error("/api/documents/projects/[id]/files GET error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
