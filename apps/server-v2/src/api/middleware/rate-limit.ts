import {
  Clock,
  Context,
  Duration,
  Effect,
  Layer,
  Option,
  Predicate,
} from "effect";
import { HttpEffect, HttpServerRequest, HttpServerResponse } from "effect/http";
import { HttpApiMiddleware } from "effect/http-api";
import { RateLimiter } from "effect/persistence";
import { CurrentUser } from "@/api/middleware/auth-user";
import { InternalServerError, TooManyRequests } from "@/api/schemas";

export class RateLimitMiddleware extends HttpApiMiddleware.Service<RateLimitMiddleware>()(
  "sigle/RateLimitMiddleware",
  { error: [TooManyRequests, InternalServerError] },
) {}

export type RateLimitPolicyName =
  | "default"
  | "draftImageUpload"
  | "profileImageUpload"
  | "profileMetadataUpload";

export interface RateLimitLimit {
  readonly points: number;
  readonly windowMs: number;
}

export const RATE_LIMITS: Record<RateLimitPolicyName, RateLimitLimit> = {
  // 60 requests per minute and per user (or IP when unauthenticated)
  default: {
    points: 60,
    windowMs: 60_000,
  },
  // Matches the legacy server limit for profile metadata uploads
  profileMetadataUpload: {
    points: 4,
    windowMs: 60_000,
  },
  // A post can hold several images, so uploads allow bursts of a few at once
  draftImageUpload: {
    points: 20,
    windowMs: 60_000,
  },
  // Matches the legacy server limit for profile avatar and cover uploads
  profileImageUpload: {
    points: 4,
    windowMs: 60_000,
  },
};

/**
 * Optional endpoint annotation selecting a named rate limit policy. Endpoints
 * without the annotation use the `default` policy.
 */
export class RateLimitPolicy extends Context.Service<
  RateLimitPolicy,
  RateLimitPolicyName
>()("sigle/RateLimitPolicy") {}

const clientKey = (request: HttpServerRequest.HttpServerRequest): string => {
  const address = request.remoteAddress;

  const ip =
    address !== undefined && Option.isSome(address) ? address.value : "unknown";

  return `ip:${ip}`;
};

const appendResponseHeaders = (headers: Record<string, string>) =>
  HttpEffect.appendPreResponseHandler((_request, response) =>
    Effect.succeed(HttpServerResponse.setHeaders(response, headers)),
  );

/**
 * Adds the rate limit headers to the response of the current request, whether
 * the handler succeeds, fails, or the request is rejected with a 429.
 * `x-ratelimit-reset` is the Unix time in seconds at which the window resets,
 * as is conventional for the `X-RateLimit-*` headers.
 */
const setRateLimitHeaders = (state: {
  readonly limit: number;
  readonly remaining: number;
  readonly resetAfter: Duration.Duration;
}) =>
  Effect.gen(function* () {
    const now = yield* Clock.currentTimeMillis;
    const resetAt = now + Duration.toMillis(state.resetAfter);

    yield* appendResponseHeaders({
      "x-ratelimit-limit": String(state.limit),
      "x-ratelimit-remaining": String(state.remaining),
      "x-ratelimit-reset": String(Math.ceil(resetAt / 1000)),
    });
  });

/**
 * `Retry-After` is a whole number of seconds, rounded up so a client never
 * retries before the window resets.
 */
const setRetryAfterHeader = (retryAfter: Duration.Duration) =>
  appendResponseHeaders({
    "retry-after": String(
      Math.max(0, Math.ceil(Duration.toMillis(retryAfter) / 1000)),
    ),
  });

export const RateLimitMiddlewareLayer: Layer.Layer<
  RateLimitMiddleware,
  never,
  RateLimiter.RateLimiter
> = Layer.effect(
  RateLimitMiddleware,
  Effect.gen(function* () {
    const limiter = yield* RateLimiter.RateLimiter;

    return (httpEffect, { endpoint }) =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;

        const user = Option.getOrUndefined(
          yield* Effect.serviceOption(CurrentUser),
        );

        const policy =
          Option.getOrUndefined(
            Context.getOption(endpoint.annotations, RateLimitPolicy),
          ) ?? "default";

        const { points, windowMs } = RATE_LIMITS[policy];

        const result = yield* limiter
          .consume({
            algorithm: "fixed-window",
            onExceeded: "fail",
            key: `${endpoint.method}:${endpoint.path}:${
              user === undefined ? clientKey(request) : `user:${user.id}`
            }`,
            limit: points,
            window: Duration.millis(windowMs),
          })
          .pipe(
            Effect.tapError((error) =>
              Predicate.isTagged(error.reason, "RateLimitExceeded")
                ? setRateLimitHeaders({
                    limit: error.reason.limit,
                    remaining: error.reason.remaining,
                    resetAfter: error.reason.retryAfter,
                  }).pipe(
                    Effect.andThen(
                      setRetryAfterHeader(error.reason.retryAfter),
                    ),
                  )
                : Effect.void,
            ),
            Effect.mapError((error) =>
              Predicate.isTagged(error.reason, "RateLimitExceeded")
                ? new TooManyRequests({
                    message: "Rate limit exceeded",
                    retryAfterMillis: Math.max(
                      0,
                      Math.ceil(Duration.toMillis(error.reason.retryAfter)),
                    ),
                  })
                : new InternalServerError({
                    message: `Rate limit store failure: ${error.reason.message}`,
                  }),
            ),
          );

        yield* setRateLimitHeaders(result);

        return yield* httpEffect;
      });
  }),
);
