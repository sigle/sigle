import { ByteSize, Effect } from "effect";
import { HttpMiddleware, HttpRouter, HttpServerRequest } from "effect/http";

/**
 * Largest request body the API reads, 413 above it. Effect reads a body
 * whole into memory and has no limit by default. Sized for the largest JSON
 * body, a draft at its `DRAFT_LIMITS.content` length of a million characters,
 * which can take 3 bytes each in UTF-8. Image uploads set their own limit.
 */
export const MAX_BODY_SIZE = ByteSize.mebibytes(4);

const bodyLimitMiddleware = HttpMiddleware.make((app) =>
  Effect.provideService(app, HttpServerRequest.MaxBodySize, MAX_BODY_SIZE),
);

export const BodyLimitLayer = HttpRouter.middleware(bodyLimitMiddleware, {
  global: true,
});
