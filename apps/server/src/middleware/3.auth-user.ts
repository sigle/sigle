import { auth } from "~/lib/auth";

export interface AuthenticatedUser {
  id: string;
}

/**
 * Requires a valid better-auth session as a cookie.
 * The user is extracted from the database and injected into the event context.
 */
export default defineEventHandler(async (event) => {
  // Only apply middleware for /api/protected/** routes
  if (!event.path.startsWith("/api/protected")) {
    return;
  }

  const headers = event.headers;

  const session = await auth.api.getSession({
    headers: headers,
  });
  if (!session) {
    throw createError({
      status: 401,
      message: "Unauthorized",
    });
  }

  // Inject the user id so it can be used in subsequent requests.
  event.context.user = {
    id: session.user.id,
  } satisfies AuthenticatedUser;
});
