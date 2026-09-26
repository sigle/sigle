import * as Sentry from "@sentry/effect/server";
import {
  type Cause,
  Effect,
  ErrorReporter,
  Layer,
  Logger,
  Match,
  Option,
  References,
  Schema,
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

const HttpStatusStruct = Schema.Struct({
  status: Schema.Number,
});

const decodeHttpStatus = Schema.decodeUnknownOption(HttpStatusStruct);

export interface HttpStatusCandidate {
  readonly status?: number | string | undefined;
  readonly message?: string | undefined;
}

export const isIgnoredHttpStatusError = (
  error: HttpStatusCandidate,
  cause?: Cause.Cause<unknown>,
): boolean => {
  const directStatus = decodeHttpStatus(error);

  if (
    Option.isSome(directStatus) &&
    IGNORED_HTTP_STATUSES.has(directStatus.value.status)
  ) {
    return true;
  }

  if (cause) {
    for (const reason of cause.reasons) {
      const original = Match.value(reason).pipe(
        Match.tag("Fail", (fail) => fail.error),
        Match.tag("Die", (die) => die.defect),
        Match.orElse(() => undefined),
      );

      const reasonStatus = decodeHttpStatus(original);

      if (
        Option.isSome(reasonStatus) &&
        IGNORED_HTTP_STATUSES.has(reasonStatus.value.status)
      ) {
        return true;
      }
    }
  }

  return false;
};

export type ErrorAttributes = ReturnType<typeof ErrorReporter.getAttributes>;

export interface ErrorCaptureTarget {
  readonly captureException: (
    error: Error,
    attributes: ErrorAttributes,
  ) => void;
}

export const makeSentryErrorReporter = (
  target: ErrorCaptureTarget = {
    captureException: (error, attributes) => {
      Sentry.withScope((scope) => {
        scope.setExtras({ ...attributes });
        Sentry.captureException(error);
      });
    },
  },
): ErrorReporter.ErrorReporter =>
  ErrorReporter.make(({ attributes, cause, error }) => {
    if (isIgnoredHttpStatusError(error, cause)) {
      return;
    }

    target.captureException(error, attributes);
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
