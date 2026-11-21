import { Effect, Layer } from "effect";
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/http";
import { RateLimiter } from "effect/persistence";
import { clientKey, consumeRateLimit } from "@/api/middleware/rate-limit";
import { TooManyRequests } from "@/api/schemas";
import { AppConfig } from "@/config";
import { AuthService } from "@/services/auth";

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

        yield* consumeRateLimit(
          limiter,
          `auth:${policy}:${clientKey(request, config)}`,
          policy,
        );

        const webRequest = yield* HttpServerRequest.toWeb(request);
        const webResponse = yield* auth.handler(webRequest);

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
                { status: 500 },
              ),
        ),
      ),
    );
  }),
);
