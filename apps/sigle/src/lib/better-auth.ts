import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import z from "zod";

/**
 * Mock what we have on the server so that the client can have proper types
 */
export const betterAuthSiws = () =>
  ({
    id: "sign-in-with-stacks",
    endpoints: {
      nonce: createAuthEndpoint(
        "/siws/nonce",
        {
          method: "POST",
          body: z.object({
            address: z.string(),
          }),
        },
        async () => {
          return { nonce: "" };
        },
      ),
      verify: createAuthEndpoint(
        "/siws/verify",
        {
          method: "POST",
          body: z.object({
            address: z.string().min(1),
            message: z.string().min(1),
            signature: z.string().min(1),
          }),
        },
        async (ctx) => {
          return ctx.json({ token: "" });
        },
      ),
    },
  }) satisfies BetterAuthPlugin;
