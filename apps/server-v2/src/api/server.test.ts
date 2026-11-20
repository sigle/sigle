import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Option, Schema } from "effect";
import { Headers, HttpClient, HttpClientResponse } from "effect/http";
import { RateLimiter } from "effect/persistence";
import { TestClock } from "effect/testing";
import type { AppConfigValues } from "@/config";
import { RATE_LIMITS } from "@/api/middleware/rate-limit";
import { makeTestServerLayer } from "@/test/server";
import packageJson from "../../package.json" with { type: "json" };

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
  info: Schema.Struct({ title: Schema.String, version: Schema.String }),
  servers: Schema.Array(Schema.Struct({ url: Schema.String })),
  tags: Schema.Array(
    Schema.Struct({
      name: Schema.String,
      description: Schema.optionalKey(Schema.String),
    }),
  ),
  components: Schema.Struct({
    schemas: Schema.Record(Schema.String, Schema.Unknown),
  }),
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

// A fixed wall clock, so `x-ratelimit-reset` is an exact Unix timestamp. It is
// set before the server starts: moving the TestClock afterwards would run
// every queue poll scheduled in between.
const NOW_MILLIS = 1_800_000_000_000;

const OpenApiSecurityDocument = Schema.Struct({
  components: Schema.Struct({
    securitySchemes: Schema.Record(Schema.String, Schema.Unknown),
    schemas: Schema.Record(Schema.String, Schema.Unknown),
  }),
  paths: Schema.Record(
    Schema.String,
    Schema.Record(
      Schema.String,
      Schema.Struct({ security: Schema.optionalKey(Schema.Unknown) }),
    ),
  ),
});

const OpenApiOperationsDocument = Schema.Struct({
  paths: Schema.Record(
    Schema.String,
    Schema.Record(
      Schema.String,
      Schema.Struct({
        summary: Schema.optionalKey(Schema.String),
        description: Schema.optionalKey(Schema.String),
        parameters: Schema.Array(
          Schema.Struct({
            name: Schema.String,
            description: Schema.optionalKey(Schema.String),
          }),
        ),
        responses: Schema.Record(Schema.String, Schema.Unknown),
      }),
    ),
  ),
});

const rateLimitHeaders = (response: HttpClientResponse.HttpClientResponse) =>
  Object.fromEntries(
    [
      "retry-after",
      "x-ratelimit-limit",
      "x-ratelimit-remaining",
      "x-ratelimit-reset",
    ].map((name) => [
      name,
      Option.getOrUndefined(Headers.get(response.headers, name)),
    ]),
  );

const serverLayer = (overrides: Partial<AppConfigValues> = {}) =>
  makeTestServerLayer(overrides);

const withServerAt = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  TestClock.setTime(NOW_MILLIS).pipe(
    Effect.andThen(effect.pipe(Effect.provide(serverLayer()))),
  );

// An in-memory store whose operations take 5 seconds after reading the clock,
// like a slow database transaction.
const SlowRateLimiter = RateLimiter.layer.pipe(
  Layer.provide(
    Layer.effect(
      RateLimiter.RateLimiterStore,
      Effect.gen(function* () {
        const store = yield* RateLimiter.RateLimiterStore;

        return RateLimiter.RateLimiterStore.of({
          ...store,
          fixedWindow: (options) =>
            store
              .fixedWindow(options)
              .pipe(Effect.tap(() => TestClock.adjust("5 seconds"))),
        });
      }),
    ).pipe(Layer.provide(RateLimiter.layerStoreMemory)),
  ),
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

      const profileImagePath = body.paths["/api/me/profile/images/{kind}"];

      expect({
        status: response.status,
        openapi: body.openapi.startsWith("3."),
        info: body.info,
        servers: body.servers.map((server) => server.url),
        undescribedTags: body.tags
          .filter((tag) => tag.description === undefined)
          .map((tag) => tag.name),
        paths: Object.keys(body.paths),
        health: Object.keys(body.paths["/health"].get?.responses ?? {}),
        me: Object.keys(body.paths["/api/me"].get?.responses ?? {}),
        uploadImage: Object.keys(profileImagePath?.put?.responses ?? {}),
        requestBody: Object.keys(
          profileImagePath?.put?.requestBody?.content ?? {},
        ),
        postMetadata: body.components.schemas["PostMetadata"],
        profileMetadata: body.components.schemas["ProfileMetadata"],
      }).toStrictEqual({
        status: 200,
        openapi: true,
        info: { title: "Sigle API", version: packageJson.version },
        servers: ["https://api.sigle.test"],
        undescribedTags: [],
        paths: expect.arrayContaining([
          "/health",
          "/api/me",
          "/api/drafts",
          "/api/drafts/{draftId}",
          "/api/me/profile",
          "/api/me/profile/images/{kind}",
          "/api/drafts/{draftId}/images",
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
        // Signed metadata schemas are generated from the `@sigle/sdk` zod
        // schemas instead of being documented as opaque values.
        postMetadata: expect.objectContaining({
          type: "object",
          required: expect.arrayContaining(["$schema", "content"]),
        }),
        profileMetadata: expect.objectContaining({
          type: "object",
          required: expect.arrayContaining(["$schema", "content"]),
        }),
      });
    }).pipe(Effect.provide(serverLayer({ API_URL: "https://api.sigle.test" }))),
  );

  it.effect("GET /_openapi.json documents auth and names its schemas", () =>
    Effect.gen(function* () {
      const response = yield* HttpClient.get("/_openapi.json");

      const json = yield* response.text;

      const doc = yield* HttpClientResponse.schemaBodyJson(
        OpenApiSecurityDocument,
      )(response);

      expect({
        securitySchemes: Object.keys(doc.components.securitySchemes),
        meSecurity: doc.paths["/api/me"]?.get?.security,
        postsSecurity: doc.paths["/api/posts"]?.get?.security,
        internalNames: Object.keys(doc.components.schemas).filter((name) =>
          name.startsWith("sigle_api_"),
        ),
        errorSchema: doc.components.schemas["NotFoundError"],
        postAuthor: json.includes(
          '"author":{"$ref":"#/components/schemas/PublicUser"}',
        ),
        healthRef: json.includes(
          '"$ref":"#/components/schemas/HealthResponse"',
        ),
      }).toStrictEqual({
        securitySchemes: ["sessionCookie"],
        meSecurity: [{ sessionCookie: [] }],
        postsSecurity: [],
        internalNames: [],
        errorSchema: {
          type: "object",
          properties: { message: { type: "string" } },
          required: ["message"],
          additionalProperties: false,
        },
        postAuthor: true,
        healthRef: true,
      });
    }).pipe(Effect.provide(serverLayer())),
  );

  it.effect("GET /_openapi.json describes every public operation", () =>
    Effect.gen(function* () {
      const response = yield* HttpClient.get("/_openapi.json");

      const json = yield* response.text;

      const doc = yield* HttpClientResponse.schemaBodyJson(
        OpenApiOperationsDocument,
      )(response);

      const operations = Object.entries(doc.paths).flatMap(([path, item]) =>
        Object.entries(item).map(([method, operation]) => ({
          name: `${method.toUpperCase()} ${path}`,
          operation,
        })),
      );

      expect({
        adminPaths: Object.keys(doc.paths).filter((path) =>
          path.startsWith("/api/admin"),
        ),
        undocumented: operations
          .filter(
            ({ operation }) =>
              operation.summary === undefined ||
              operation.description === undefined,
          )
          .map(({ name }) => name),
        undescribedParameters: operations.flatMap(({ name, operation }) =>
          operation.parameters
            .filter((parameter) => parameter.description === undefined)
            .map((parameter) => `${name} ${parameter.name}`),
        ),
        // `Schema.Int` alone documents `minimum: -(2^53 - 1)`.
        negativeIntegers: json.includes("-9007199254740991"),
        // The rate limit middleware adds them, the endpoint no longer lists
        // them itself.
        draftImageResponses: Object.keys(
          doc.paths["/api/drafts/{draftId}/images"]?.post?.responses ?? {},
        ),
      }).toStrictEqual({
        adminPaths: [],
        undocumented: [],
        undescribedParameters: [],
        negativeIntegers: false,
        draftImageResponses: expect.arrayContaining(["429", "500"]),
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

  it.effect("sets rate limit headers on error responses", () =>
    Effect.gen(function* () {
      const response = yield* HttpClient.get("/api/posts/missing");

      expect({
        status: response.status,
        headers: rateLimitHeaders(response),
      }).toStrictEqual({
        status: 404,
        headers: {
          "retry-after": undefined,
          "x-ratelimit-limit": "60",
          "x-ratelimit-remaining": "59",
          "x-ratelimit-reset": String(NOW_MILLIS / 1000 + 60),
        },
      });
    }).pipe(withServerAt),
  );

  it.effect("does not shift the reset time by the store latency", () =>
    Effect.gen(function* () {
      const response = yield* HttpClient.get("/health");

      expect(rateLimitHeaders(response)["x-ratelimit-reset"]).toBe(
        String(NOW_MILLIS / 1000 + 60),
      );
    }).pipe(
      Effect.provide(
        // Polls every 10 seconds so the 5 second store delay runs no queue poll
        makeTestServerLayer({}, [], {
          pollInterval: "10 seconds",
          rateLimiter: SlowRateLimiter,
        }),
      ),
      (effect) => TestClock.setTime(NOW_MILLIS).pipe(Effect.andThen(effect)),
    ),
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

      const body = last === undefined ? undefined : yield* last.json;

      expect({
        before: previous?.status,
        last: last?.status,
        body,
        remaining:
          previous === undefined
            ? undefined
            : Option.getOrUndefined(
                Headers.get(previous.headers, "x-ratelimit-remaining"),
              ),
        rejectedHeaders:
          last === undefined ? undefined : rateLimitHeaders(last),
      }).toStrictEqual({
        before: 200,
        last: 429,
        // The status identifies the error, the body has no `_tag`.
        body: {
          message: "Rate limit exceeded",
          retryAfterMillis: expect.any(Number),
        },
        remaining: "0",
        rejectedHeaders: {
          "retry-after": "60",
          "x-ratelimit-limit": "60",
          "x-ratelimit-remaining": "0",
          "x-ratelimit-reset": String(NOW_MILLIS / 1000 + 60),
        },
      });
    }).pipe(withServerAt),
  );
});
