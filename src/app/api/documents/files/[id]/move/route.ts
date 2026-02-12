import { NextResponse } from "next/server";
import { moveFile } from "@/queries/files";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const folderId: string | null | undefined = body.folderId ?? null;

    await moveFile(id, folderId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/documents/files/[id]/move PATCH error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
