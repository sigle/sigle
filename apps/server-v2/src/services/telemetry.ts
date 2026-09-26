import * as Sentry from "@sentry/effect/server";
import {
  type Cause,
  Effect,
  ErrorReporter,
  Layer,
  Logger,
  Option,
  References,
  Tracer,
} from "effect";
import { AppConfig } from "@/config";

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// Ensure BigInt values serialize cleanly in JSON responses and logs
// oxlint-disable-next-line no-extend-native
BigInt.prototype.toJSON = function toJSON() {
  return this.toString();
};

const IGNORED_HTTP_STATUSES = new Set([401, 404, 422]);

const extractStatus = (value: unknown): number | undefined => {
  if (typeof value === "object" && value !== null && "status" in value) {
    const status = (value as { readonly status?: unknown }).status;
    if (typeof status === "number") {
      return status;
    }
  }
  return undefined;
};

export const isIgnoredHttpStatusError = (
  error: unknown,
  cause?: Cause.Cause<unknown>,
): boolean => {
  const directStatus = extractStatus(error);
  if (directStatus !== undefined && IGNORED_HTTP_STATUSES.has(directStatus)) {
    return true;
  }

  if (cause) {
    for (const reason of cause.reasons) {
      const original =
        reason._tag === "Fail"
          ? reason.error
          : reason._tag === "Die"
            ? reason.defect
            : undefined;
      const reasonStatus = extractStatus(original);
      if (
        reasonStatus !== undefined &&
        IGNORED_HTTP_STATUSES.has(reasonStatus)
      ) {
        return true;
      }
    }
  }

  return false;
};

export interface ErrorCaptureTarget {
  readonly captureException: (
    error: unknown,
    attributes: Record<string, unknown>,
  ) => void;
}

export const makeSentryErrorReporter = (
  target: ErrorCaptureTarget = {
    captureException: (error, attributes) => {
      Sentry.withScope((scope) => {
        scope.setExtras(attributes);
        Sentry.captureException(error);
      });
    },
  },
): ErrorReporter.ErrorReporter =>
  ErrorReporter.make(({ attributes, cause, error }) => {
    if (isIgnoredHttpStatusError(error, cause)) {
      return;
    }
    target.captureException(error, { ...attributes });
  });

export const SentryErrorReporter: ErrorReporter.ErrorReporter =
  makeSentryErrorReporter();

const SentryLifecycleLayer = Layer.effectDiscard(
  Effect.acquireRelease(Effect.void, () =>
    Effect.promise(() => Sentry.close(2000)),
  ),
);

export const TelemetryLayer: Layer.Layer<never, never, AppConfig> =
  Layer.unwrap(
    Effect.gen(function* () {
      const config = yield* AppConfig;
      const consoleLogger =
        config.NODE_ENV === "production"
          ? Logger.consoleJson
          : Logger.consolePretty();
      const minLogLevel = config.NODE_ENV === "test" ? "Error" : "Info";

      if (Option.isSome(config.SENTRY_DSN)) {
        return Layer.mergeAll(
          Sentry.effectLayer({
            dsn: config.SENTRY_DSN.value,
            environment: config.SIGLE_ENV,
          }),
          SentryLifecycleLayer,
          Layer.succeed(Tracer.Tracer, Sentry.SentryEffectTracer),
          Logger.layer([
            consoleLogger,
            Logger.tracerLogger,
            Sentry.SentryEffectLogger,
          ]),
          ErrorReporter.layer([SentryErrorReporter]),
          Layer.succeed(References.MinimumLogLevel, minLogLevel),
        );
      }

      return Layer.mergeAll(
        Logger.layer([consoleLogger, Logger.tracerLogger]),
        Layer.succeed(References.MinimumLogLevel, minLogLevel),
      );
    }),
  );
