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
import { isIPv6 } from "node:net";
import { CurrentUser } from "@/api/middleware/auth-user";
import { InternalServerError, TooManyRequests } from "@/api/schemas";
import { AppConfig, type AppConfigValues } from "@/config";

export class RateLimitMiddleware extends HttpApiMiddleware.Service<RateLimitMiddleware>()(
  "sigle/RateLimitMiddleware",
  { error: [TooManyRequests, InternalServerError] },
) {}

/**
 * The `global` limit of the client IP. Add it last on a group, so it runs
 * first, before the session check: anonymous requests to signed-in routes then
 * count too.
 */
export class GlobalRateLimitMiddleware extends HttpApiMiddleware.Service<GlobalRateLimitMiddleware>()(
  "sigle/GlobalRateLimitMiddleware",
  { error: [TooManyRequests, InternalServerError] },
) {}

export type RateLimitPolicyName =
  | "default"
  | "global"
  | "draftImageUpload"
  | "draftPublish"
  | "profileImageUpload"
  | "profileMetadataUpload"
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
  // Every request of a client IP, across all endpoints and signed-in or not:
  // the other limits are per endpoint, and accounts are free to create
  global: {
    points: 300,
    windowMs: 60_000,
  },
  // Matches the legacy server limit for profile metadata uploads
  profileMetadataUpload: {
    points: 4,
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

const ipv6Groups = (address: string): ReadonlyArray<number> => {
  const parse = (part: string) =>
    part === ""
      ? []
      : part.split(":").flatMap((group) => {
          if (!group.includes(".")) return [Number.parseInt(group, 16)];

          const [a = 0, b = 0, c = 0, d = 0] = group.split(".").map(Number);

          return [a * 256 + b, c * 256 + d];
        });

  const [head = "", tail] = address.split("::");
  const start = parse(head);
  const end = tail === undefined ? [] : parse(tail);

  return [
    ...start,
    ...Array.from({ length: 8 - start.length - end.length }, () => 0),
    ...end,
  ];
};

/**
 * The address a client is limited by. An IPv4-mapped IPv6 address is its IPv4
 * address. Any other IPv6 address is its /64, which an ISP hands to a single
 * subscriber, so rotating addresses within it gives no fresh limit.
 */
const rateLimitAddress = (ip: string): string => {
  const address = ip.split("%")[0] ?? ip;

  if (!isIPv6(address)) return ip;

  const groups = ipv6Groups(address);

  if (
    groups.slice(0, 5).every((group) => group === 0) &&
    groups[5] === 0xffff
  ) {
    const [high = 0, low = 0] = groups.slice(6);

    return [
      Math.floor(high / 256),
      high % 256,
      Math.floor(low / 256),
      low % 256,
    ].join(".");
  }

  return `${groups
    .slice(0, 4)
    .map((group) => group.toString(16))
    .join(":")}::/64`;
};

/**
 * Rate limit key of a client: its IP from `CLIENT_IP_HEADER` when the proxy in
 * front of the API sets one, else the socket address, with IPv6 addresses
 * grouped by /64.
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

  return `ip:${rateLimitAddress(ip)}`;
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

/**
 * The website's server-side reads come over the private network for all its
 * visitors at once, so they share no per-client limit. Only reads: the paid
 * and write routes stay limited whoever calls them.
 */
const isPrivateNetworkRead = (
  request: HttpServerRequest.HttpServerRequest,
  config: AppConfigValues,
): boolean =>
  request.method === "GET" && isPrivateNetworkRequest(request, config);

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

/**
 * Consumes a point of the client IP's `global` limit. Call it before the
 * endpoint's own limit, so the response carries the endpoint's headers unless
 * the global limit is the one exceeded. Every request consumes one point:
 * through `GlobalRateLimitMiddleware` on the API, directly on `/api/auth/*`.
 */
export const consumeGlobalRateLimit = (
  limiter: RateLimiter.RateLimiter,
  request: HttpServerRequest.HttpServerRequest,
  config: AppConfigValues,
) =>
  consumeRateLimit(limiter, `global:${clientKey(request, config)}`, "global");

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

        if (isPrivateNetworkRead(request, config)) {
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

export const GlobalRateLimitMiddlewareLayer: Layer.Layer<
  GlobalRateLimitMiddleware,
  never,
  RateLimiter.RateLimiter | AppConfig
> = Layer.effect(
  GlobalRateLimitMiddleware,
  Effect.gen(function* () {
    const limiter = yield* RateLimiter.RateLimiter;
    const config = yield* AppConfig;

    return (httpEffect) =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;

        if (!isPrivateNetworkRead(request, config)) {
          yield* consumeGlobalRateLimit(limiter, request, config);
        }

        return yield* httpEffect;
      });
  }),
);
