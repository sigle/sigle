import { describe, expect, it } from "@effect/vitest";
import * as Sentry from "@sentry/effect/server";
import {
  ConfigProvider,
  Data,
  Effect,
  ErrorReporter,
  Option,
  Tracer,
} from "effect";
import { AppConfig } from "@/config";
import {
  type ErrorAttributes,
  TelemetryLayer,
  isIgnoredHttpStatusError,
  makeSentryErrorReporter,
} from "@/services/telemetry";

class HttpStatusError extends Data.TaggedError("HttpStatusError")<{
  readonly status: number;
  readonly message: string;
}> {}

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

  it.effect(
    "reports 500 errors and skips 401/404/422 errors in SentryErrorReporter",
    () =>
      Effect.gen(function* () {
        const captured: Array<{
          readonly error: Error;
          readonly attributes: ErrorAttributes;
        }> = [];

        const reporter = makeSentryErrorReporter({
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
      Effect.provide(AppConfig.layerTest()),
    ),
  );

  it.effect("traces with OTLP instead of Sentry when OTLP export is on", () =>
    Effect.gen(function* () {
      const tracerWith = (env: Record<string, string>) =>
        Effect.service(Tracer.Tracer).pipe(
          Effect.provide(TelemetryLayer),
          Effect.provide(
            AppConfig.layerTest({
              SENTRY_DSN: Option.some("http://public@127.0.0.1:9/1"),
            }),
          ),
          Effect.provide(ConfigProvider.layer(ConfigProvider.fromEnv({ env }))),
        );

      expect(yield* tracerWith({})).toBe(Sentry.SentryEffectTracer);

      // The variables Railway sets on a traced service, plus the exporter.
      const otlpTracer = yield* tracerWith({
        OTEL_TRACES_EXPORTER: "otlp",
        OTEL_EXPORTER_OTLP_ENDPOINT: "http://127.0.0.1:4318",
        OTEL_SERVICE_NAME: "server",
      });

      expect(otlpTracer).not.toBe(Sentry.SentryEffectTracer);
      expect(otlpTracer).not.toBe(Tracer.Tracer.defaultValue());
    }),
  );
});
