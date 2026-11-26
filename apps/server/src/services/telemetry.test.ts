import { describe, expect, it } from "@effect/vitest";
import { ConfigProvider, Data, Effect, ErrorReporter, Tracer } from "effect";
import type { CapturedException } from "@/services/posthog";
import type { ErrorAttributes } from "@/services/telemetry";
import { AppConfig } from "@/config";
import { PostHogService } from "@/services/posthog";
import {
  TelemetryLayer,
  conventionalSpanName,
  isIgnoredHttpStatusError,
  makeErrorReporter,
} from "@/services/telemetry";

class HttpStatusError extends Data.TaggedError("HttpStatusError")<{
  readonly status: number;
  readonly message: string;
}> {
  readonly [ErrorReporter.attributes] = { jobId: "job-1" };
}

describe("telemetry service", () => {
  it("serializes BigInt values to string in JSON", () => {
    const payload = { height: 12345678901234567890n };
    expect(JSON.stringify(payload)).toBe('{"height":"12345678901234567890"}');
  });

  it("identifies ignored HTTP status errors (401, 404, 422)", () => {
    expect(isIgnoredHttpStatusError({ status: 401 })).toBe(true);
    expect(isIgnoredHttpStatusError({ status: 404 })).toBe(true);
    expect(isIgnoredHttpStatusError({ status: 422 })).toBe(true);
    expect(isIgnoredHttpStatusError({ status: 500 })).toBe(false);
    expect(isIgnoredHttpStatusError(new Error("unexpected"))).toBe(false);
  });

  it.effect("reports 500 errors and skips 401/404/422 errors", () =>
    Effect.gen(function* () {
      const captured: Array<{
        readonly error: Error;
        readonly attributes: ErrorAttributes;
      }> = [];

      const reporter = makeErrorReporter({
        captureException: (error, attributes) => {
          captured.push({ error, attributes });
        },
      });

      const reporterLayer = ErrorReporter.layer([reporter]);

      // 404 error should be ignored
      yield* Effect.fail(
        new HttpStatusError({ status: 404, message: "Not Found" }),
      ).pipe(
        Effect.withErrorReporting,
        Effect.provide(reporterLayer),
        Effect.exit,
      );

      expect(captured).toHaveLength(0);

      // 500 error should be captured
      yield* Effect.fail(
        new HttpStatusError({
          status: 500,
          message: "Internal Server Error",
        }),
      ).pipe(
        Effect.withErrorReporting,
        Effect.provide(reporterLayer),
        Effect.exit,
      );

      expect(captured).toHaveLength(1);
    }),
  );

  it.effect("initializes TelemetryLayer cleanly with test config", () =>
    Effect.logInfo("Test log message").pipe(
      Effect.withSpan("test-span"),
      Effect.provide(TelemetryLayer),
      Effect.provide([AppConfig.layerTest(), PostHogService.layerTest()]),
    ),
  );

  it.effect("reports server errors to PostHog with their attributes", () =>
    Effect.gen(function* () {
      const exceptions: Array<CapturedException> = [];

      const fail = (status: number) =>
        Effect.fail(
          new HttpStatusError({ status, message: `Status ${status}` }),
        ).pipe(
          Effect.withErrorReporting,
          Effect.provide(TelemetryLayer),
          Effect.provide([
            AppConfig.layerTest(),
            PostHogService.layerTest([], exceptions),
          ]),
          Effect.exit,
        );

      yield* fail(404);
      yield* fail(500);

      expect(
        exceptions.map(({ error, properties }) => ({
          message: error.message,
          properties,
        })),
      ).toStrictEqual([
        { message: "Status 500", properties: { jobId: "job-1" } },
      ]);
    }),
  );

  it.each([
    [
      "server",
      { "http.request.method": "GET", "http.route": "/api/posts/:postId" },
      "GET /api/posts/:postId",
    ],
    // An unmatched request has no route: Effect's name is kept.
    ["server", { "http.request.method": "GET" }, undefined],
    // Queries from the job queue, the rate limiter and drizzle.
    [
      "client",
      {
        "db.query.text": `WITH cte AS (
          UPDATE "effect_queue" SET acquired_at = NOW()
          WHERE sequence IN (SELECT sequence FROM "effect_queue" FOR UPDATE SKIP LOCKED LIMIT 1)
        ) SELECT * FROM cte`,
      },
      "UPDATE effect_queue",
    ],
    [
      "client",
      {
        "db.query.text":
          'select "key", "points" from "rate_limiter_flexible" where "rate_limiter_flexible"."key" = $1 for update',
      },
      "SELECT rate_limiter_flexible",
    ],
    [
      "client",
      {
        "db.query.text":
          'insert into "media_image" ("key") values ($1) on conflict ("key") do update set "width" = $2',
      },
      "INSERT media_image",
    ],
    [
      "client",
      { "db.query.text": 'delete from "draft" where "draft"."id" = $1' },
      "DELETE draft",
    ],
    [
      "client",
      {
        "db.query.text":
          'insert into "drizzle"."__drizzle_migrations" ("hash") values ($1)',
      },
      "INSERT __drizzle_migrations",
    ],
    // BEGIN and COMMIT have no query text and are already named after it.
    ["client", { "db.operation.name": "BEGIN" }, undefined],
  ] as const)("names a %s span %j as %s", (kind, attributes, expected) => {
    expect(
      conventionalSpanName({
        kind,
        attributes: new Map(Object.entries(attributes)),
      }),
    ).toBe(expected);
  });

  it.effect("traces with OTLP only when OTLP export is on", () =>
    Effect.gen(function* () {
      const tracerWith = (env: Record<string, string>) =>
        Effect.service(Tracer.Tracer).pipe(
          Effect.provide(TelemetryLayer),
          Effect.provide([AppConfig.layerTest(), PostHogService.layerTest()]),
          Effect.provide(ConfigProvider.layer(ConfigProvider.fromEnv({ env }))),
        );

      expect(yield* tracerWith({})).toBe(Tracer.Tracer.defaultValue());

      // The variables Railway sets on a traced service, plus the exporter.
      const otlpTracer = yield* tracerWith({
        OTEL_TRACES_EXPORTER: "otlp",
        OTEL_EXPORTER_OTLP_ENDPOINT: "http://127.0.0.1:4318",
        OTEL_SERVICE_NAME: "server",
      });

      expect(otlpTracer).not.toBe(Tracer.Tracer.defaultValue());
    }),
  );
});
