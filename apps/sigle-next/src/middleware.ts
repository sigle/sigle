export { auth as middleware } from '@/lib/auth-edge';

export const config = {
  // The matcher is required to avoid duplicate cookies on logout from next-auth
  // without it, logout is not working as cookies are overwritten by the middleware
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
