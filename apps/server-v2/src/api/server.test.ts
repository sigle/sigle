import { NodeHttpServer } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Option, Schema } from "effect";
import {
  Headers,
  HttpClient,
  HttpClientResponse,
  HttpRouter,
} from "effect/unstable/http";
import { AppConfig, type AppConfigValues } from "@/config";
import { ApiRoutesLayer } from "@/main";
import { RateLimiterTest } from "@/services/rate-limiter";

const HealthResponse = Schema.Struct({
  success: Schema.Boolean,
});

const OpenApiResponse = Schema.Struct({
  openapi: Schema.String,
  paths: Schema.Record(
    Schema.String,
    Schema.Struct({
      get: Schema.Struct({
        responses: Schema.Record(Schema.String, Schema.Unknown),
      }),
    }),
  ),
});

const TooManyRequestsResponse = Schema.Struct({
  _tag: Schema.Literal("TooManyRequests"),
  message: Schema.String,
  retryAfterMillis: Schema.Number,
});

const serverLayer = (overrides: Partial<AppConfigValues> = {}) =>
  HttpRouter.serve(ApiRoutesLayer, {
    disableListenLog: true,
    disableLogger: true,
  }).pipe(
    Layer.provideMerge(NodeHttpServer.layerTest),
    Layer.provide(RateLimiterTest),
    Layer.provide(AppConfig.layerTest(overrides)),
  );

describe("http server", () => {
  it.effect("GET /health returns 200", () =>
    Effect.gen(function* () {
      const response = yield* HttpClient.get("/health");

      const body =
        yield* HttpClientResponse.schemaBodyJson(HealthResponse)(response);

      expect(response.status).toBe(200);
      expect(body).toStrictEqual({ success: true });
    }).pipe(Effect.provide(serverLayer())),
  );

  it.effect("GET /_openapi.json returns the generated spec", () =>
    Effect.gen(function* () {
      const response = yield* HttpClient.get("/_openapi.json");

      const body =
        yield* HttpClientResponse.schemaBodyJson(OpenApiResponse)(response);

      expect(response.status).toBe(200);
      expect(body.openapi.startsWith("3.")).toBe(true);
      expect(Object.keys(body.paths)).toContain("/health");
      expect(Object.keys(body.paths["/health"].get.responses)).toContain("200");
      expect(Object.keys(body.paths["/health"].get.responses)).toContain("429");
    }).pipe(Effect.provide(serverLayer())),
  );

  it.effect("GET /_scalar serves the API reference", () =>
    Effect.gen(function* () {
      const response = yield* HttpClient.get("/_scalar");

      expect(response.status).toBe(200);
    }).pipe(Effect.provide(serverLayer())),
  );

  it.effect("adds CORS headers for the configured app origin", () =>
    Effect.gen(function* () {
      const response = yield* HttpClient.get("/health", {
        headers: { origin: "http://localhost:3000" },
      });

      expect(
        Option.getOrUndefined(
          Headers.get(response.headers, "access-control-allow-origin"),
        ),
      ).toBe("http://localhost:3000");
      expect(
        Option.getOrUndefined(
          Headers.get(response.headers, "access-control-allow-credentials"),
        ),
      ).toBe("true");
    }).pipe(Effect.provide(serverLayer())),
  );

  it.effect("answers CORS preflight requests", () =>
    Effect.gen(function* () {
      const response = yield* HttpClient.options("/health", {
        headers: {
          origin: "http://localhost:3000",
          "access-control-request-method": "GET",
        },
      });

      expect(response.status).toBe(204);
      expect(
        Option.getOrUndefined(
          Headers.get(response.headers, "access-control-allow-origin"),
        ),
      ).toBe("http://localhost:3000");
      expect(
        Option.getOrUndefined(
          Headers.get(response.headers, "access-control-allow-methods"),
        ),
      ).toContain("GET");
    }).pipe(Effect.provide(serverLayer())),
  );

  it.effect("returns 429 once the rate limit is exceeded", () =>
    Effect.gen(function* () {
      const first = yield* HttpClient.get("/health");
      const second = yield* HttpClient.get("/health");
      const third = yield* HttpClient.get("/health");

      const body = yield* HttpClientResponse.schemaBodyJson(
        TooManyRequestsResponse,
      )(third);

      expect([first.status, second.status, third.status]).toStrictEqual([
        200, 200, 429,
      ]);
      expect(body.message).toBe("Rate limit exceeded");

      const remaining = Option.getOrUndefined(
        Headers.get(second.headers, "x-ratelimit-remaining"),
      );
      expect(remaining).toBe("0");
    }).pipe(
      Effect.provide(
        serverLayer({ RATE_LIMIT_POINTS: 2, RATE_LIMIT_WINDOW_MS: 60_000 }),
      ),
    ),
  );
});
