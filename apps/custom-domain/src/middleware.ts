import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host");

  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = url.pathname;

  return NextResponse.rewrite(new URL(`/s/${hostname}${path}`, request.url));
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|websites/|img/|[\\w-]+\\.\\w+).*)",
    // Match custom routes paths
    "/sitemap.xml",
    "/robots.txt",
  ],
};
