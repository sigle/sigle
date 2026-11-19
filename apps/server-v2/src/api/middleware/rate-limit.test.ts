import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Logger } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";
import { RateLimiter } from "effect/persistence";
import { InternalServerError } from "@/api/schemas";
import { makeTestServerLayer } from "@/test/server";

const storeError = new RateLimiter.RateLimiterError({
  reason: new RateLimiter.RateLimitStoreError({
    message: 'relation "rate_limit" does not exist',
    cause: new Error('relation "rate_limit" does not exist'),
  }),
});

const FailingRateLimiter = RateLimiter.layer.pipe(
  Layer.provide(
    Layer.succeed(RateLimiter.RateLimiterStore, {
      fixedWindow: () => Effect.fail(storeError),
      tokenBucket: () => Effect.fail(storeError),
      adaptiveConsume: () => Effect.fail(storeError),
      adaptiveFeedback: () => Effect.fail(storeError),
    }),
  ),
);

describe("rateLimitMiddleware", () => {
  it.effect(
    "logs a store failure and returns a generic 500 to the client",
    () => {
      const logs: Array<unknown> = [];

      const CapturingLogger = Logger.layer([
        Logger.make(({ message }) => {
          logs.push(message);
        }),
      ]);

      return Effect.gen(function* () {
        const response = yield* HttpClient.get("/health");

        const body =
          yield* HttpClientResponse.schemaBodyJson(InternalServerError)(
            response,
          );

        expect({
          status: response.status,
          message: body.message,
        }).toStrictEqual({ status: 500, message: "Rate limit check failed." });
        expect(logs.flat()).toContain("Rate limit store failure");
      }).pipe(
        Effect.provide(
          makeTestServerLayer({}, [], { rateLimiter: FailingRateLimiter }).pipe(
            Layer.provide(CapturingLogger),
          ),
        ),
      );
    },
  );
});
