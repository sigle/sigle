import { describe, expect, it } from "@effect/vitest";
import { Effect, Option, Schema } from "effect";
import { Headers, HttpClient, HttpClientResponse } from "effect/unstable/http";
import type { AppConfigValues } from "@/config";
import { RATE_LIMITS } from "@/api/middleware/rate-limit";
import { makeTestServerLayer } from "@/test/server";

const HealthResponse = Schema.Struct({
  success: Schema.Boolean,
});

const OpenApiOperation = Schema.Struct({
  responses: Schema.Record(Schema.String, Schema.Unknown),
  requestBody: Schema.optionalKey(
    Schema.Struct({
      content: Schema.Record(Schema.String, Schema.Unknown),
    }),
  ),
});

const OpenApiResponse = Schema.Struct({
  openapi: Schema.String,
  paths: Schema.Record(
    Schema.String,
    Schema.Struct({
      get: Schema.optionalKey(OpenApiOperation),
      post: Schema.optionalKey(OpenApiOperation),
      put: Schema.optionalKey(OpenApiOperation),
      delete: Schema.optionalKey(OpenApiOperation),
    }),
  ),
});

const TooManyRequestsResponse = Schema.TaggedStruct("TooManyRequests", {
  message: Schema.String,
  retryAfterMillis: Schema.Finite,
});

const serverLayer = (overrides: Partial<AppConfigValues> = {}) =>
  makeTestServerLayer(overrides);

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

      const profileImagePath =
        body.paths["/api/protected/user/profile/images/{kind}"];

      expect({
        status: response.status,
        openapi: body.openapi.startsWith("3."),
        paths: Object.keys(body.paths),
        health: Object.keys(body.paths["/health"].get?.responses ?? {}),
        me: Object.keys(body.paths["/api/protected/me"].get?.responses ?? {}),
        uploadImage: Object.keys(profileImagePath?.put?.responses ?? {}),
        requestBody: Object.keys(
          profileImagePath?.put?.requestBody?.content ?? {},
        ),
      }).toStrictEqual({
        status: 200,
        openapi: true,
        paths: expect.arrayContaining([
          "/health",
          "/api/protected/me",
          "/api/protected/drafts",
          "/api/protected/drafts/{draftId}",
          "/api/protected/user/profile/upload-metadata",
          "/api/protected/user/profile/images/{kind}",
        ]),
        health: expect.arrayContaining(["200", "429"]),
        me: expect.arrayContaining(["200", "401"]),
        uploadImage: expect.arrayContaining([
          "200",
          "400",
          "413",
          "415",
          "429",
          "500",
        ]),
        requestBody: expect.arrayContaining([
          "image/jpeg",
          "image/png",
          "image/webp",
        ]),
      });
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
      const limit = RATE_LIMITS.default.points;

      const responses = yield* Effect.forEach(
        Array.from({ length: limit + 1 }, (_, index) => index),
        () => HttpClient.get("/health"),
        { concurrency: 1 },
      );

      const previous = responses[limit - 1];
      const last = responses[limit];

      const body =
        last === undefined
          ? undefined
          : yield* HttpClientResponse.schemaBodyJson(TooManyRequestsResponse)(
              last,
            );

      expect({
        before: previous?.status,
        last: last?.status,
        message: body?.message,
        remaining:
          previous === undefined
            ? undefined
            : Option.getOrUndefined(
                Headers.get(previous.headers, "x-ratelimit-remaining"),
              ),
      }).toStrictEqual({
        before: 200,
        last: 429,
        message: "Rate limit exceeded",
        remaining: "0",
      });
    }).pipe(Effect.provide(serverLayer())),
  );
});
