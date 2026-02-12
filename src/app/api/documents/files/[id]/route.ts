import { NextResponse } from "next/server";
import { deleteFile } from "@/queries/files";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }
    await deleteFile(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("/api/documents/files/[id] DELETE error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
