import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /websites (inside /public) - sites assets
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|websites/|[\\w-]+\\.\\w+).*)',
    // Match custom routes paths
    '/sitemap.xml',
    '/robots.txt',
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  const hostname = req.headers.get('host');

  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = url.pathname;

  // Rewrite everything else to `/_sites/[site] dynamic route
  return NextResponse.rewrite(new URL(`/_sites/${hostname}${path}`, req.url));
}
