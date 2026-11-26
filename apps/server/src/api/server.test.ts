import type { IncomingHttpHeaders } from "node:http";
import { describe, expect, it } from "@effect/vitest";
import {
  Effect,
  ErrorReporter,
  Layer,
  Option,
  Predicate,
  Schema,
} from "effect";
import {
  Headers,
  HttpClient,
  HttpClientResponse,
  HttpServer,
} from "effect/http";
import { RateLimiter } from "effect/persistence";
import { TestClock } from "effect/testing";
import { request as httpRequest } from "node:http";
import type { AppConfigValues } from "@/config";
import { RATE_LIMITS } from "@/api/middleware/rate-limit";
import { makeErrorReporter } from "@/services/telemetry";
import { createAuthenticatedClient } from "@/test/helpers";
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

/**
 * Sends a request with its own `Host` header, which the fetch-based test
 * client replaces with the server's address.
 */
const requestWithHost = (options: {
  readonly method: string;
  readonly path: string;
  readonly headers: { readonly host: string; readonly cookie?: string };
}) =>
  Effect.gen(function* () {
    const { address } = yield* HttpServer.HttpServer;

    if (Predicate.isTagged(address, "UnixPathAddress")) {
      return yield* Effect.die("The test server listens on TCP");
    }

    return yield* Effect.promise(
      () =>
        new Promise<{
          readonly status: number | undefined;
          readonly headers: IncomingHttpHeaders;
        }>((resolve, reject) => {
          const request = httpRequest(
            {
              host: "127.0.0.1",
              port: address.port,
              method: options.method,
              path: options.path,
              headers: options.headers,
            },
            (response) => {
              response.resume();
              response.on("end", () =>
                resolve({
                  status: response.statusCode,
                  headers: response.headers,
                }),
              );
            },
          );

          request.on("error", reject);
          request.end();
        }),
    );
  });

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

      expect({
        status: response.status,
        body,
        // Probes are not rate limited.
        rateLimit: rateLimitHeaders(response)["x-ratelimit-limit"],
      }).toStrictEqual({
        status: 200,
        body: { success: true },
        rateLimit: undefined,
      });
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
        health: Object.keys(body.paths["/health"].get?.responses ?? {}).sort(),
        me: Object.keys(body.paths["/api/me"].get?.responses ?? {}).sort(),
        uploadImage: Object.keys(profileImagePath?.put?.responses ?? {}),
        requestBody: Object.keys(
          profileImagePath?.put?.requestBody?.content ?? {},
        ),
        createDraft: body.components.schemas["CreateDraftPayload"],
        postMetadata: body.components.schemas["PostMetadata"],
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
          "/api/me/profile/bns",
          "/api/me/profile/images/{kind}",
          "/api/drafts/{draftId}/images",
        ]),
        // Endpoints without inputs cannot fail schema validation, so they
        // document no 400 response.
        // Not rate limited either.
        health: ["200"],
        me: ["200", "401", "429", "500"],
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
        createDraft: expect.objectContaining({
          properties: expect.objectContaining({
            coverImage: {
              anyOf: [
                { type: "string", format: "uri", maxLength: 2048 },
                { type: "null" },
              ],
            },
            canonicalUri: {
              anyOf: [
                { type: "string", format: "uri", maxLength: 200 },
                { type: "null" },
              ],
            },
          }),
        }),
        // The signed post metadata schema is generated from the `@sigle/sdk`
        // zod schema instead of being documented as opaque values.
        postMetadata: expect.objectContaining({
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

  it.effect("does not report client errors", () => {
    const captured: Array<string> = [];

    const reporter = makeErrorReporter({
      captureException: (error) => {
        captured.push(error.name);
      },
    });

    return Effect.gen(function* () {
      const anonymous = yield* HttpClient.HttpClient;
      const unauthorized = yield* anonymous.get("/api/me");
      const { client } = yield* createAuthenticatedClient();
      const notFound = yield* client.get("/api/drafts/missing");
      const badRequest = yield* client.get("/api/drafts?limit=0");

      expect({
        statuses: [unauthorized.status, notFound.status, badRequest.status],
        captured,
      }).toStrictEqual({ statuses: [401, 404, 400], captured: [] });
    }).pipe(
      Effect.provide(
        makeTestServerLayer().pipe(
          Layer.provide(ErrorReporter.layer([reporter])),
        ),
      ),
    );
  });

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
      // Without them the app cannot read redirects, ETags or rate limits.
      expect(
        Option.getOrUndefined(
          Headers.get(response.headers, "access-control-expose-headers"),
        ),
      ).toBe(
        "location,etag,retry-after,x-ratelimit-limit,x-ratelimit-remaining,x-ratelimit-reset",
      );
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

  it.effect("keys unauthenticated clients by the configured IP header", () => {
    const remaining = Effect.forEach(
      [
        "203.0.113.1",
        "203.0.113.2",
        "203.0.113.1",
        // The same IPv4 client, as an IPv4-mapped IPv6 address
        "::ffff:203.0.113.2",
        // Two addresses of one /64, then the next /64
        "2001:db8:a:b::1",
        "2001:db8:a:b:ffff:1:2:3",
        "2001:db8:a:c::1",
        // `::` shortening reaching into the /64
        "2001:db8::1",
        "2001:db8:0:0:1::",
      ],
      (ip) =>
        HttpClient.get("/api/posts/missing", {
          headers: { "x-real-ip": ip },
        }).pipe(
          Effect.map(
            (response) => rateLimitHeaders(response)["x-ratelimit-remaining"],
          ),
        ),
      { concurrency: 1 },
    );

    return Effect.gen(function* () {
      expect({
        configured: yield* remaining.pipe(
          Effect.provide(
            serverLayer({ CLIENT_IP_HEADER: Option.some("x-real-ip") }),
          ),
        ),
        // Without a proxy setting it, clients could pick any value.
        unset: yield* remaining.pipe(Effect.provide(serverLayer())),
      }).toStrictEqual({
        configured: ["59", "59", "58", "58", "59", "58", "59", "59", "58"],
        unset: ["59", "58", "57", "56", "55", "54", "53", "52", "51"],
      });
    });
  });

  it.effect("limits each client IP across endpoints and accounts", () =>
    Effect.gen(function* () {
      const ip = "203.0.113.7";
      const first = yield* createAuthenticatedClient();
      const second = yield* createAuthenticatedClient();

      const get = (path: string, headers: Record<string, string> = {}) =>
        HttpClient.get(path, { headers: { "x-real-ip": ip, ...headers } });

      // 300 requests, 50 on each of six endpoints, half of them signed in, so
      // no endpoint limit of 60 is reached. Anonymous requests to a signed-in
      // route count too, though they fail the session check.
      const statuses = yield* Effect.forEach(
        [
          ["/api/me", first.cookie],
          ["/api/drafts", first.cookie],
          ["/api/drafts/missing", first.cookie],
          ["/api/posts", undefined],
          ["/api/posts/missing", undefined],
          ["/api/drafts", undefined],
        ] as const,
        ([path, cookie]) =>
          Effect.forEach(
            Array.from({ length: 50 }),
            () =>
              get(path, cookie === undefined ? {} : { cookie }).pipe(
                Effect.map(({ status }) => status),
              ),
            { concurrency: 1 },
          ),
        { concurrency: 1 },
      );

      // Another account from the same IP shares its global limit.
      const rejected = yield* get("/api/me", { cookie: second.cookie });

      const otherIp = yield* HttpClient.get("/api/posts/missing", {
        headers: { "x-real-ip": "203.0.113.8" },
      });

      expect({
        // Each request counts once, so the first 300 all pass
        limitedBefore: statuses.flat().filter((status) => status === 429)
          .length,
        rejected: [rejected.status, rateLimitHeaders(rejected)],
        otherIp: [otherIp.status, rateLimitHeaders(otherIp)],
      }).toStrictEqual({
        limitedBefore: 0,
        rejected: [
          429,
          {
            "retry-after": "60",
            "x-ratelimit-limit": "300",
            "x-ratelimit-remaining": "0",
            "x-ratelimit-reset": String(NOW_MILLIS / 1000 + 60),
          },
        ],
        otherIp: [
          404,
          {
            "retry-after": undefined,
            "x-ratelimit-limit": "60",
            "x-ratelimit-remaining": "59",
            "x-ratelimit-reset": String(NOW_MILLIS / 1000 + 60),
          },
        ],
      });
    }).pipe(
      Effect.provide(
        serverLayer({ CLIENT_IP_HEADER: Option.some("x-real-ip") }),
      ),
      (effect) => TestClock.setTime(NOW_MILLIS).pipe(Effect.andThen(effect)),
    ),
  );

  it.effect("does not rate limit GET requests from the private network", () => {
    const privateHost = "sigle.railway.internal:8080";

    // Past the default limit of the endpoint, then a write with the same host.
    const requests = Effect.gen(function* () {
      const reads = yield* Effect.forEach(
        Array.from({ length: RATE_LIMITS.default.points + 1 }),
        () =>
          requestWithHost({
            method: "GET",
            path: "/api/posts/missing",
            headers: { host: privateHost },
          }),
        { concurrency: 1 },
      );

      const { cookie } = yield* createAuthenticatedClient();

      const write = yield* requestWithHost({
        method: "DELETE",
        path: "/api/drafts/missing",
        headers: { host: privateHost, cookie },
      });

      const publicRead = yield* requestWithHost({
        method: "GET",
        path: "/api/posts/missing",
        headers: { host: "api.sigle.test" },
      });

      return {
        lastRead: reads.at(-1)?.status,
        readLimited: reads.some(
          ({ headers }) => headers["x-ratelimit-limit"] !== undefined,
        ),
        write: [write.status, write.headers["x-ratelimit-remaining"]],
        publicRead: [
          publicRead.status,
          publicRead.headers["x-ratelimit-remaining"],
        ],
      };
    });

    return Effect.gen(function* () {
      expect({
        configured: yield* requests.pipe(
          Effect.provide(
            serverLayer({
              RAILWAY_PRIVATE_DOMAIN: Option.some("sigle.railway.internal"),
            }),
          ),
        ),
        // Off Railway, any client could send that host.
        unset: yield* requests.pipe(
          Effect.map(({ lastRead }) => lastRead),
          Effect.provide(serverLayer()),
        ),
      }).toStrictEqual({
        configured: {
          lastRead: 404,
          readLimited: false,
          write: [404, "59"],
          publicRead: [404, "59"],
        },
        unset: 429,
      });
    });
  });

  it.effect("does not shift the reset time by the store latency", () =>
    Effect.gen(function* () {
      const response = yield* HttpClient.get("/api/posts/missing");

      // The global limit is checked first and takes 5 seconds, so the
      // endpoint's window opens at +5 s. Reading the clock after its store
      // returned would give +10 s.
      expect(rateLimitHeaders(response)["x-ratelimit-reset"]).toBe(
        String(NOW_MILLIS / 1000 + 5 + 60),
      );
    }).pipe(
      Effect.provide(
        // Polls every 20 seconds so the two 5 second store delays run no
        // queue poll
        makeTestServerLayer({}, [], {
          pollInterval: "20 seconds",
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
        () => HttpClient.get("/api/posts/missing"),
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
        before: 404,
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
