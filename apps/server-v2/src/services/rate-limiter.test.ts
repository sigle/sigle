import { describe, expect, it } from "@effect/vitest";
import { Duration, Effect, Layer } from "effect";
import { TestClock } from "effect/testing";
import { RateLimiter } from "effect/unstable/persistence";
import { RateLimiterStoreDrizzle } from "@/services/rate-limiter";
import { TestDatabaseLayer } from "@/test/layer";

const TestRateLimiterLayer = RateLimiter.layer.pipe(
  Layer.provide(RateLimiterStoreDrizzle),
  Layer.provide(TestDatabaseLayer),
);

describe("rate-limiter drizzle store", () => {
  it.effect("enforces the fixed window limit", () =>
    Effect.gen(function* () {
      const limiter = yield* RateLimiter.RateLimiter;
      const options = {
        algorithm: "fixed-window" as const,
        onExceeded: "fail" as const,
        key: "fixed-window",
        limit: 2,
        window: Duration.minutes(1),
      };

      const first = yield* limiter.consume(options);
      const second = yield* limiter.consume(options);
      const error = yield* limiter.consume(options).pipe(Effect.flip);

      expect({
        first: first.remaining,
        second: second.remaining,
        errorTag: error.reason._tag,
      }).toStrictEqual({
        first: 1,
        second: 0,
        errorTag: "RateLimitExceeded",
      });
    }).pipe(Effect.provide(TestRateLimiterLayer)),
  );

  it.effect("resets the fixed window once it expires", () =>
    Effect.gen(function* () {
      const limiter = yield* RateLimiter.RateLimiter;
      const options = {
        algorithm: "fixed-window" as const,
        onExceeded: "fail" as const,
        key: "fixed-window-expiry",
        limit: 2,
        window: Duration.minutes(1),
      };

      yield* limiter.consume(options);
      yield* limiter.consume(options);
      yield* TestClock.adjust("61 seconds");
      const result = yield* limiter.consume(options);

      expect(result.remaining).toBe(1);
    }).pipe(Effect.provide(TestRateLimiterLayer)),
  );

  it.effect("enforces the token bucket limit", () =>
    Effect.gen(function* () {
      const limiter = yield* RateLimiter.RateLimiter;
      const options = {
        algorithm: "token-bucket" as const,
        onExceeded: "fail" as const,
        key: "token-bucket",
        limit: 2,
        window: Duration.minutes(1),
      };

      const first = yield* limiter.consume(options);
      const second = yield* limiter.consume(options);
      const error = yield* limiter.consume(options).pipe(Effect.flip);

      expect({
        first: first.remaining,
        second: second.remaining,
        errorTag: error.reason._tag,
      }).toStrictEqual({
        first: 1,
        second: 0,
        errorTag: "RateLimitExceeded",
      });
    }).pipe(Effect.provide(TestRateLimiterLayer)),
  );
});
