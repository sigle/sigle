import { getToken } from 'next-auth/jwt';
import { env } from '~/env';
import { prisma } from '~/lib/prisma';

export interface AuthenticatedUser {
  id: string;
}

/**
 * Requires a valid next-auth session as a cookie.
 * The user is extracted from the database and injected into the event context.
 */
export default defineEventHandler(async (event) => {
  // Only apply middleware for /api/protected/** routes
  if (!event.path.startsWith('/api/protected')) {
    return;
  }

  console.log('headers', event.headers);

  const token = await getToken({
    req: event,
    secret: env.AUTH_SECRET,
  });

  console.log('token', token);

  if (!token || !token.address) {
    throw createError({
      status: 401,
      message: 'Unauthorized',
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: token.address as string,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw createError({
      status: 401,
      message: 'Unauthorized',
    });
  }

  // Inject the user id so it can be used in subsequent requests.
  event.context.user = {
    id: user.id,
  } satisfies AuthenticatedUser;
});
