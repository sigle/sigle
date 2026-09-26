import { eq } from "drizzle-orm";
import { Duration, Effect, Layer } from "effect";
import { RateLimiter } from "effect/unstable/persistence";
import { Database } from "@/db";
import { rateLimiterFlexible } from "@/db/schema";

const TOKEN_BUCKET_KEY_SUFFIX = ":token-bucket";

const adaptiveUnsupported = () =>
  new RateLimiter.RateLimiterError({
    reason: new RateLimiter.RateLimitStoreError({
      message: "Adaptive rate limiting is not supported by the Drizzle store",
    }),
  });

/**
 * Persistent `RateLimiterStore` backed by the `rate_limiter_flexible` table.
 *
 * Fixed-window counters and token buckets are stored in the shared
 * `key`/`points`/`expire` row and updated inside a transaction so concurrent
 * requests cannot corrupt the state. Adaptive rate limiting is not implemented.
 */
export const makeDrizzleRateLimiterStore = Effect.gen(function* () {
  const db = yield* Database;

  const currentTimeMillis = Effect.clockWith((clock) =>
    Effect.sync(() => clock.currentTimeMillisUnsafe()),
  );

  const withStoreError = <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    message: string,
  ): Effect.Effect<A, RateLimiter.RateLimiterError, R> =>
    Effect.mapError(
      effect,
      (cause) =>
        new RateLimiter.RateLimiterError({
          reason: new RateLimiter.RateLimitStoreError({ message, cause }),
        }),
    );

  return RateLimiter.RateLimiterStore.of({
    fixedWindow: (options) =>
      Effect.gen(function* () {
        const now = yield* currentTimeMillis;
        const refillMillis = Duration.toMillis(options.refillRate);

        return yield* withStoreError(
          db.transaction((tx) =>
            Effect.gen(function* () {
              const [existing] = yield* tx
                .select()
                .from(rateLimiterFlexible)
                .where(eq(rateLimiterFlexible.key, options.key))
                .for("update");

              if (
                existing !== undefined &&
                existing.expire !== null &&
                existing.expire.getTime() > now
              ) {
                if (
                  options.limit &&
                  existing.points + options.tokens > options.limit
                ) {
                  return [
                    existing.points + options.tokens,
                    existing.expire.getTime() - now,
                  ] as const;
                }

                const points = existing.points + options.tokens;
                const expire = new Date(
                  existing.expire.getTime() + refillMillis * options.tokens,
                );
                yield* tx
                  .update(rateLimiterFlexible)
                  .set({ points, expire })
                  .where(eq(rateLimiterFlexible.key, options.key));
                return [points, expire.getTime() - now] as const;
              }

              const points = options.tokens;
              const expire = new Date(now + refillMillis * options.tokens);
              yield* tx
                .insert(rateLimiterFlexible)
                .values({ key: options.key, points, expire })
                .onConflictDoUpdate({
                  target: rateLimiterFlexible.key,
                  set: { points, expire },
                });
              return [points, refillMillis * options.tokens] as const;
            }),
          ),
          "Failed to execute fixedWindow rate limiting command",
        );
      }),

    tokenBucket: (options) =>
      Effect.gen(function* () {
        const now = yield* currentTimeMillis;
        const refillMillis = Duration.toMillis(options.refillRate);
        const key = `${options.key}${TOKEN_BUCKET_KEY_SUFFIX}`;

        return yield* withStoreError(
          db.transaction((tx) =>
            Effect.gen(function* () {
              const [existing] = yield* tx
                .select()
                .from(rateLimiterFlexible)
                .where(eq(rateLimiterFlexible.key, key))
                .for("update");

              let tokens = options.limit;
              let lastRefill = now;

              if (existing !== undefined && existing.expire !== null) {
                tokens = existing.points;
                lastRefill = existing.expire.getTime();
              }

              const tokensToAdd = Math.floor((now - lastRefill) / refillMillis);
              if (tokensToAdd > 0) {
                tokens = Math.min(options.limit, tokens + tokensToAdd);
                lastRefill += tokensToAdd * refillMillis;
              }
              if (tokens >= options.limit) {
                lastRefill = now;
              }

              const remaining = tokens - options.tokens;
              if (options.allowOverflow || remaining >= 0) {
                tokens = remaining;
              }

              const expire = new Date(lastRefill);
              yield* tx
                .insert(rateLimiterFlexible)
                .values({ key, points: tokens, expire })
                .onConflictDoUpdate({
                  target: rateLimiterFlexible.key,
                  set: { points: tokens, expire },
                });

              return [remaining, Math.max(0, now - lastRefill)] as const;
            }),
          ),
          "Failed to execute tokenBucket rate limiting command",
        );
      }),

    adaptiveConsume: () => Effect.fail(adaptiveUnsupported()),
    adaptiveFeedback: () => Effect.fail(adaptiveUnsupported()),
  });
});

export const RateLimiterStoreDrizzle: Layer.Layer<
  RateLimiter.RateLimiterStore,
  never,
  Database
> = Layer.effect(RateLimiter.RateLimiterStore, makeDrizzleRateLimiterStore);

/**
 * Live `RateLimiter` backed by the database.
 */
export const RateLimiterLive: Layer.Layer<
  RateLimiter.RateLimiter,
  never,
  Database
> = RateLimiter.layer.pipe(Layer.provide(RateLimiterStoreDrizzle));

/**
 * Test `RateLimiter` backed by a process-local in-memory store.
 */
export const RateLimiterTest: Layer.Layer<RateLimiter.RateLimiter> =
  RateLimiter.layer.pipe(Layer.provide(RateLimiter.layerStoreMemory));
