import { transformMiddlewareRequest } from "@axiomhq/nextjs";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/axiom/server";

export async function proxy(request: NextRequest) {
  logger.info(...transformMiddlewareRequest(request));
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const { pathname } = request.nextUrl;

  if (pathname === "/login") {
    if (session?.user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/cron/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/") && !session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard", "/api/:path*"],
};
