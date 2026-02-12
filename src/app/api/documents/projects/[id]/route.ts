import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { folder } from "@/db/schema";
import { auth } from "@/lib/auth";
import { deleteFolder } from "@/queries/files";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    const result = await db
      .select()
      .from(folder)
      .where(and(eq(folder.id, id), eq(folder.userId, userId)))
      .limit(1);

    if (!result[0]) {
      return new NextResponse("Project not found", { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("/api/documents/projects/[id] GET error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }
    await deleteFolder(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("/api/documents/projects/[id] DELETE error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
