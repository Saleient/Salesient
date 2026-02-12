import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getRootFilesForSearch } from "@/queries/projects";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const files = await getRootFilesForSearch(session.user.id);
    return Response.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
