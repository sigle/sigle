import { defineEventHandler, toRequest } from "nitro/h3";
import { auth } from "~/lib/auth";

/**
 * This is the entry point for the better-auth API.
 * It exposes all the required endpoints for authentication.
 */
export default defineEventHandler((event) => {
  return auth.handler(toRequest(event) as any);
});
