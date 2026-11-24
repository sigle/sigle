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
import { AppConfig, type AppConfigValues } from "@/config";

export class RateLimitMiddleware extends HttpApiMiddleware.Service<RateLimitMiddleware>()(
  "sigle/RateLimitMiddleware",
  { error: [TooManyRequests, InternalServerError] },
) {}

export type RateLimitPolicyName =
  | "bnsProfileImport"
  | "default"
  | "draftImageUpload"
  | "draftPublish"
  | "planRefresh"
  | "profileImageUpload"
  | "profileUpdate"
  | "signIn";

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
  // A profile update is a database write, this only stops scripted spam
  profileUpdate: {
    points: 10,
    windowMs: 60_000,
  },
  // Matches the legacy server limit for post metadata uploads, each publish
  // pays for an Arweave upload
  draftPublish: {
    points: 4,
    windowMs: 60_000,
  },
  // A post can hold several images, so uploads allow bursts of a few at once
  draftImageUpload: {
    points: 20,
    windowMs: 60_000,
  },
  // Each import makes two read-only contract calls on the Stacks API
  bnsProfileImport: {
    points: 6,
    windowMs: 60_000,
  },
  // Each refresh checks every wallet of the user on the Stacks API
  planRefresh: {
    points: 6,
    windowMs: 60_000,
  },
  // Matches the legacy server limit for profile avatar and cover uploads
  profileImageUpload: {
    points: 4,
    windowMs: 60_000,
  },
  // Per IP on the Sign in with Stacks routes, a sign-in needs one nonce and
  // one verification
  signIn: {
    points: 10,
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

/**
 * Rate limit key of an unauthenticated client: its IP from `CLIENT_IP_HEADER`
 * when the proxy in front of the API sets one, else the socket address.
 */
export const clientKey = (
  request: HttpServerRequest.HttpServerRequest,
  config: AppConfigValues,
): string => {
  const forwarded = Option.flatMap(config.CLIENT_IP_HEADER, (name) =>
    Option.fromNullishOr(request.headers[name]?.trim() || undefined),
  );

  const ip = Option.getOrElse(
    Option.orElse(forwarded, () => request.remoteAddress),
    () => "unknown",
  );

  return `ip:${ip}`;
};

/**
 * Whether a request came from another service of the project, over Railway's
 * private network: it is addressed to this service's private domain. Railway's
 * edge answers requests for that domain itself, so a public client can't send
 * one here.
 */
export const isPrivateNetworkRequest = (
  request: HttpServerRequest.HttpServerRequest,
  config: AppConfigValues,
): boolean =>
  Option.exists(
    config.RAILWAY_PRIVATE_DOMAIN,
    (domain) => request.headers.host?.replace(/:\d+$/, "") === domain,
  );

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
const setRateLimitHeaders = (
  observedAt: number,
  state: {
    readonly limit: number;
    readonly remaining: number;
    readonly resetAfter: Duration.Duration;
  },
) =>
  appendResponseHeaders({
    "x-ratelimit-limit": String(state.limit),
    "x-ratelimit-remaining": String(state.remaining),
    "x-ratelimit-reset": String(
      Math.ceil((observedAt + Duration.toMillis(state.resetAfter)) / 1000),
    ),
  });

/**
 * `Retry-After` is a whole number of seconds, rounded up so a client never
 * retries before the window resets.
 */
export const setRetryAfterHeader = (retryAfter: Duration.Duration) =>
  appendResponseHeaders({
    "retry-after": String(
      Math.max(0, Math.ceil(Duration.toMillis(retryAfter) / 1000)),
    ),
  });

/**
 * Consumes a point of `policy` for `key`, setting the rate limit headers of the
 * current response. Fails with a `TooManyRequests` once the limit is exceeded.
 */
export const consumeRateLimit = (
  limiter: RateLimiter.RateLimiter,
  key: string,
  policy: RateLimitPolicyName,
): Effect.Effect<
  void,
  TooManyRequests | InternalServerError,
  HttpServerRequest.HttpServerRequest
> =>
  Effect.gen(function* () {
    const { points, windowMs } = RATE_LIMITS[policy];

    // The store measures `resetAfter` from the time it reads when the
    // operation starts. Reading the clock after the store returns would push
    // the reset time back by the store's latency.
    const observedAt = yield* Clock.currentTimeMillis;

    const result = yield* limiter
      .consume({
        algorithm: "fixed-window",
        onExceeded: "fail",
        key,
        limit: points,
        window: Duration.millis(windowMs),
      })
      .pipe(
        Effect.tapError((error) =>
          Predicate.isTagged(error.reason, "RateLimitExceeded")
            ? setRateLimitHeaders(observedAt, {
                limit: error.reason.limit,
                remaining: error.reason.remaining,
                resetAfter: error.reason.retryAfter,
              }).pipe(
                Effect.andThen(setRetryAfterHeader(error.reason.retryAfter)),
              )
            : Effect.logError("Rate limit store failure", {
                cause: error.reason,
                policy,
              }),
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
                message: "Rate limit check failed.",
              }),
        ),
      );

    yield* setRateLimitHeaders(observedAt, result);
  });

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

        // The website's server-side reads come over the private network for
        // all its visitors at once, so they share no per-client limit. Only
        // reads: the paid and write routes stay limited whoever calls them.
        if (
          request.method === "GET" &&
          isPrivateNetworkRequest(request, config)
        ) {
          return yield* httpEffect;
        }

        const user = Option.getOrUndefined(
          yield* Effect.serviceOption(CurrentUser),
        );

        const policy =
          Option.getOrUndefined(
            Context.getOption(endpoint.annotations, RateLimitPolicy),
          ) ?? "default";

        yield* consumeRateLimit(
          limiter,
          `${endpoint.method}:${endpoint.path}:${
            user === undefined ? clientKey(request, config) : `user:${user.id}`
          }`,
          policy,
        );

        return yield* httpEffect;
      });
  }),
);
