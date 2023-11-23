import { NextRequest, NextResponse } from 'next/server';

/**
 * The goal of this middleware is to force https server side.
 * Fly.io does not provide this option internally.
 */
export function middleware(req: NextRequest) {
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers.get('x-forwarded-proto') !== 'https'
  ) {
    return NextResponse.redirect(
      `https://${req.nextUrl.hostname}${req.nextUrl.pathname}`,
      301,
    );
  }
  return NextResponse.next();
}
