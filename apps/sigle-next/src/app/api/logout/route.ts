import { env } from '@/env';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * This function is used as a workaround as I didn't manage to get the logout to work with next-auth
 */
export async function GET(request: Request) {
  const userCookies = await cookies();
  const useSecureCookies = env.NEXT_PUBLIC_APP_URL.startsWith('https://');
  const cookiePrefix = useSecureCookies ? '__Secure-' : '';
  userCookies.delete(`${cookiePrefix}authjs.session-token`);
  userCookies.delete('authjs.csrf-token');
  return NextResponse.redirect(new URL('/', env.NEXT_PUBLIC_APP_URL));
}
