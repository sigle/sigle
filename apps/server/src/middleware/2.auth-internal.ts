import { HTTPError, defineEventHandler } from "nitro/h3";
import { env } from "@/env";

/**
 * Requires a valid internal token to call the internal API.
 */
export default defineEventHandler(async (event) => {
  // Only apply middleware for /api/internal/** routes
  const url = event.req.url;
  if (!url || !url.startsWith("/api/internal")) {
    return;
  }

  const internalToken = event.headers
    .get("authorization")
    ?.replace("Bearer ", "");

  if (!internalToken || internalToken !== env.INTERNAL_API_TOKEN) {
    throw new HTTPError({
      status: 401,
      message: "Unauthorized",
    });
  }
});
