import { ByteSize, Effect, Layer, Predicate } from "effect";
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/http";
import { RateLimiter } from "effect/persistence";
import {
  clientKey,
  consumeGlobalRateLimit,
  consumeRateLimit,
} from "@/api/middleware/rate-limit";
import { BadRequest, PayloadTooLarge, TooManyRequests } from "@/api/schemas";
import { AppConfig } from "@/config";
import { AuthService } from "@/services/auth";

/**
 * Largest body of the auth routes, 64 KiB. Anyone can call them, and their
 * bodies are small JSON, such as a signed Sign in with Stacks message.
 */
export const AUTH_MAX_BODY_SIZE = ByteSize.mebibytes(1 / 16);

const readAuthBody = (request: HttpServerRequest.HttpServerRequest) =>
  request.arrayBuffer.pipe(
    Effect.provideService(HttpServerRequest.MaxBodySize, AUTH_MAX_BODY_SIZE),
    Effect.mapError((error) =>
      Predicate.isTagged(error.reason, "RequestParseError") &&
      error.reason.reason === "BodyTooLarge"
        ? new PayloadTooLarge({ message: "Request body is too large." })
        : new BadRequest({ message: "Failed to read request body." }),
    ),
  );

const webResponseToHttpResponse = (
  response: Response,
): Effect.Effect<HttpServerResponse.HttpServerResponse> =>
  Effect.promise(async () => {
    const body = new Uint8Array(await response.arrayBuffer());
    const setCookie = response.headers.getSetCookie();

    return HttpServerResponse.uint8Array(body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers),
        "set-cookie": setCookie.length > 0 ? setCookie : undefined,
      },
    });
  });

export const AuthRoutesLayer = Layer.unwrap(
  Effect.gen(function* () {
    const auth = yield* AuthService;
    const limiter = yield* RateLimiter.RateLimiter;
    const config = yield* AppConfig;

    return HttpRouter.add("*", "/api/auth/*", (request) =>
      Effect.gen(function* () {
        // The routes are not part of `SigleApi`, so they are limited here
        // rather than by `RateLimitMiddleware`, always per IP as they run
        // before the user is known. The bucket is the policy, not the path:
        // the wildcard matches any path, and a key per path would give each
        // made-up path a fresh limit and the store an unbounded set of keys.
        const { pathname } = new URL(request.url, config.API_URL);

        const policy = pathname.startsWith("/api/auth/siws/")
          ? "signIn"
          : "default";

        yield* consumeGlobalRateLimit(limiter, request, config);

        yield* consumeRateLimit(
          limiter,
          `auth:${policy}:${clientKey(request, config)}`,
          policy,
        );

        const webRequest = yield* HttpServerRequest.toWeb(request);

        // `toWeb` streams the body to better-auth without `MaxBodySize`, so
        // it is read here first, within the limit of the auth routes.
        const webResponse = yield* auth.handler(
          request.method === "GET" || request.method === "HEAD"
            ? webRequest
            : new Request(webRequest, { body: yield* readAuthBody(request) }),
        );

        return yield* webResponseToHttpResponse(webResponse);
      }).pipe(
        Effect.catch((error) =>
          error instanceof TooManyRequests
            ? HttpServerResponse.json(
                {
                  message: error.message,
                  retryAfterMillis: error.retryAfterMillis,
                },
                { status: 429 },
              )
            : HttpServerResponse.json(
                { message: error.message },
                {
                  status:
                    error instanceof PayloadTooLarge
                      ? 413
                      : error instanceof BadRequest
                        ? 400
                        : 500,
                },
              ),
        ),
      ),
    );
  }),
);
