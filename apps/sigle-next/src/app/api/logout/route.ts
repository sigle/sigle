import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * This function is used as a workaround as I didn't manage to get the logout to work with next-auth
 */
export async function GET(request: Request) {
  const userCookies = await cookies();
  userCookies.delete('authjs.session-token');
  userCookies.delete('authjs.csrf-token');
  return NextResponse.redirect(new URL('/', request.url));
}
