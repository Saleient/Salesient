import { NextResponse } from "next/server";
import { getDownloadURL } from "@/queries/files";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }
    const url = await getDownloadURL(id);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("/api/documents/files/[id]/download error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
