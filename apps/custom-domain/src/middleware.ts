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
    '/((?!api/|_next/|_static/|websites/|img/|[\\w-]+\\.\\w+).*)',
    // Match custom routes paths
    '/sitemap.xml',
    '/robots.txt',
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  const hostname = req.headers.get('host');

  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  let path = url.pathname;

  // If the path is `/` or `/page/1` we rewrite to `/page/1`
  if (path === '/') {
    path = '/page/1';
  } else if (path === '/page/1') {
    // redirect to /
    return NextResponse.redirect(req.nextUrl.origin);
  }

  // Rewrite everything else to `/sites/[site] dynamic route
  return NextResponse.rewrite(new URL(`/sites/${hostname}${path}`, req.url));
}
