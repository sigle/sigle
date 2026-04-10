import { HTTPError, defineEventHandler } from "nitro/h3";
import { auth } from "@/lib/auth";

export interface AuthenticatedUser {
  id: string;
}

/**
 * Requires a valid better-auth session as a cookie.
 * The user is extracted from the database and injected into the event context.
 */
export default defineEventHandler(async (event) => {
  // Only apply middleware for /api/protected/** routes
  const url = new URL(event.req.url);
  if (!url.pathname.startsWith("/api/protected")) {
    return;
  }

  const session = await auth.api.getSession({
    headers: event.req.headers,
  });
  if (!session) {
    throw new HTTPError({
      status: 401,
      message: "Unauthorized",
    });
  }

  // Inject the user id so it can be used in subsequent requests.
  event.context.user = {
    id: session.user.id,
  } satisfies AuthenticatedUser;
});
