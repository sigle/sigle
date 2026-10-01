import { Context, Duration, Effect, Layer, Option, Predicate } from "effect";
import { HttpServerRequest, HttpServerResponse } from "effect/http";
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

        const response = yield* httpEffect;

        return HttpServerResponse.setHeaders(response, {
          "x-ratelimit-limit": String(result.limit),
          "x-ratelimit-remaining": String(result.remaining),
          "x-ratelimit-reset": String(
            Math.ceil(Duration.toMillis(result.resetAfter) / 1000),
          ),
        });
      });
  }),
);
