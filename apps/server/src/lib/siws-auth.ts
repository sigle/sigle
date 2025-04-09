// Adapted from https://github.com/better-auth/better-auth/issues/1594#issuecomment-2692434209
import * as Sentry from "@sentry/node";
import {
  generateSiwsNonce,
  verifySiwsMessage,
} from "@sigle/sign-in-with-stacks";
import { generateId } from "better-auth";
import { type BetterAuthPlugin } from "better-auth";
import { APIError, createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { z } from "zod";
import { env } from "~/env";
import { prisma } from "./prisma";

export const betterAuthSiws = () =>
  ({
    id: "sign-in-with-stacks",
    endpoints: {
      // Generate nonce endpoint
      nonce: createAuthEndpoint(
        "/siws/nonce",
        {
          method: "POST",
          body: z.object({
            address: z.string(),
          }),
        },
        async (ctx) => {
          const nonce = generateSiwsNonce();
          // Store nonce with 15-minute expiration
          await ctx.context.internalAdapter.createVerificationValue({
            id: generateId(),
            identifier: `siws_${ctx.body.address.toLowerCase()}`,
            value: nonce,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          });
          return { nonce };
        },
      ),
      // Verify siws payload
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
          const { address, message, signature } = ctx.body;

          try {
            // Find stored nonce to check it's validity
            const verification =
              await ctx.context.internalAdapter.findVerificationValue(
                `siws_${address.toLowerCase()}`,
              );

            // Ensure nonce is valid and not expired
            if (!verification || new Date() > verification.expiresAt) {
              throw new APIError("UNAUTHORIZED", {
                message: "Unauthorized: Invalid or expired nonce",
              });
            }

            // Verify SIWS message
            const valid = verifySiwsMessage({
              message,
              signature,
              address,
              domain: new URL(env.APP_URL).host,
              nonce: verification.value,
            });

            if (!valid) {
              throw new APIError("UNAUTHORIZED", {
                message: "Unauthorized: Invalid SIWS signature",
              });
            }

            // Delete used nonce to prevent replay attacks
            await ctx.context.internalAdapter.deleteVerificationValue(
              verification.id,
            );

            let user = await prisma.user.findFirst({
              select: {
                id: true,
                createdAt: true,
                updatedAt: true,
              },
              where: {
                id: address,
              },
            });

            if (!user) {
              user = await ctx.context.internalAdapter.createUser({
                id: address,
              } as any);
            }

            const session = await ctx.context.internalAdapter.createSession(
              user.id,
              ctx.request,
            );

            if (!session) {
              return ctx.json(null, {
                status: 500,
                body: {
                  message: "Internal Server Error",
                },
              });
            }

            await setSessionCookie(ctx, { session, user: user as any });

            return ctx.json({ token: session.token });
          } catch (error: any) {
            if (error instanceof APIError) throw error;
            Sentry.captureException(error);
            throw new APIError("UNAUTHORIZED", {
              message: "Something went wrong. Please try again later.",
              error: error.message,
            });
          }
        },
      ),
    },
  }) satisfies BetterAuthPlugin;
