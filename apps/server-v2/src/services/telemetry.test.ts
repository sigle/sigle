import { describe, expect, it } from "@effect/vitest";
import { Data, Effect, ErrorReporter } from "effect";
import { AppConfig } from "@/config";
import {
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
          readonly error: unknown;
          readonly attributes: Record<string, unknown>;
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
    Effect.gen(function* () {
      yield* Effect.logInfo("Test log message").pipe(
        Effect.withSpan("test-span"),
      );
    }).pipe(
      Effect.provide(TelemetryLayer),
      Effect.provide(AppConfig.layerTest()),
    ),
  );
});
