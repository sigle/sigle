import { Duration, Effect, Layer, Option, Predicate } from "effect";
import { HttpServerRequest, HttpServerResponse } from "effect/unstable/http";
import { HttpApiMiddleware } from "effect/unstable/httpapi";
import { RateLimiter } from "effect/unstable/persistence";
import { InternalServerError, TooManyRequests } from "@/api/schemas";
import { AppConfig } from "@/config";

export class RateLimitMiddleware extends HttpApiMiddleware.Service<RateLimitMiddleware>()(
  "sigle/RateLimitMiddleware",
  { error: [TooManyRequests, InternalServerError] },
) {}

const clientKey = (request: HttpServerRequest.HttpServerRequest): string => {
  const address = request.remoteAddress;

  const ip =
    address !== undefined && Option.isSome(address) ? address.value : "unknown";

  return `ip:${ip}`;
};

export const RateLimitMiddlewareLayer: Layer.Layer<
  RateLimitMiddleware,
  never,
  RateLimiter.RateLimiter | AppConfig
> = Layer.effect(
  RateLimitMiddleware,
  Effect.gen(function* () {
    const limiter = yield* RateLimiter.RateLimiter;
    const config = yield* AppConfig;

    return (httpEffect, { endpoint }) =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;

        const result = yield* limiter
          .consume({
            algorithm: "fixed-window",
            onExceeded: "fail",
            key: `${endpoint.method}:${endpoint.path}:${clientKey(request)}`,
            limit: config.RATE_LIMIT_POINTS,
            window: Duration.millis(config.RATE_LIMIT_WINDOW_MS),
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
