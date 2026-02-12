import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getProjectsForSearch } from "@/queries/projects";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const projects = await getProjectsForSearch(session.user.id);
    return Response.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
