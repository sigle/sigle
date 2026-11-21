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
import { FetchHttpClient } from "effect/http";
import { OtlpSerialization, OtlpTracer } from "effect/observability";
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
  status: Schema.Finite,
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

// The first statement keyword wins, so `WITH cte AS (UPDATE ...)` is an
// UPDATE and `SELECT ... FOR UPDATE` a SELECT. The table can be quoted and
// qualified by its schema, as in `"drizzle"."__drizzle_migrations"`.
const SQL_STATEMENTS = [
  ["SELECT", /\bselect\b[\s\S]*?\bfrom\s+(?:"?\w+"?\.)?"?(\w+)/i],
  ["INSERT", /\binsert\s+into\s+(?:"?\w+"?\.)?"?(\w+)/i],
  ["UPDATE", /\bupdate\s+(?:"?\w+"?\.)?"?(\w+)/i],
  ["DELETE", /\bdelete\s+from\s+(?:"?\w+"?\.)?"?(\w+)/i],
] as const;

const SpanNameAttributes = Schema.Struct({
  "http.request.method": Schema.optionalKey(Schema.String),
  "http.route": Schema.optionalKey(Schema.String),
  "db.query.text": Schema.optionalKey(Schema.String),
});

const decodeSpanNameAttributes = Schema.decodeUnknownOption(SpanNameAttributes);

/**
 * The OpenTelemetry name of a span, from attributes only known once it ends:
 * `GET /api/posts/:postId` for a routed request and the query summary, such
 * as `SELECT post`, for an SQL statement. Effect names the first before
 * routing (`GET`) and the second after its database (`railway`).
 */
export const conventionalSpanName = (
  span: Pick<Tracer.Span, "kind" | "attributes">,
): string | undefined => {
  const attributes = decodeSpanNameAttributes(
    Object.fromEntries(span.attributes),
  );

  if (Option.isNone(attributes)) {
    return undefined;
  }

  const {
    "http.request.method": method,
    "http.route": route,
    "db.query.text": query,
  } = attributes.value;

  if (span.kind === "server" && method !== undefined && route !== undefined) {
    return `${method} ${route}`;
  }

  if (span.kind !== "client" || query === undefined) {
    return undefined;
  }

  return SQL_STATEMENTS.flatMap(([statement, pattern]) => {
    const match = pattern.exec(query);

    return match === null
      ? []
      : [{ index: match.index, name: `${statement} ${match[1]}` }];
  }).toSorted((first, second) => first.index - second.index)[0]?.name;
};

// Effect spans have no rename, but the OTLP exporter reads the name when the
// span ends, so it is set just before.
const withConventionalSpanNames = (tracer: Tracer.Tracer): Tracer.Tracer =>
  Tracer.make({
    context: tracer.context,
    span: (options) => {
      const span = tracer.span(options);
      const end = span.end.bind(span);

      // SAFETY: `end` and `name` are plain properties of the OTLP tracer's
      // spans; the interface only marks them readonly for callers.
      const mutableSpan = span as { end: Tracer.Span["end"]; name: string };

      mutableSpan.end = (endTime, exit) => {
        const name = conventionalSpanName(span);

        if (name !== undefined) {
          mutableSpan.name = name;
        }

        end(endTime, exit);
      };

      return span;
    },
  });

// Exports spans over OTLP/HTTP when `OTEL_TRACES_EXPORTER=otlp` and an OTLP
// endpoint are set: Railway provides the endpoint, headers and service name
// on traced services. Otherwise it provides no tracer.
const OtlpTracingLayer = Layer.unwrap(
  Effect.map(Effect.service(Tracer.Tracer), (tracer) =>
    tracer === Tracer.nativeTracer
      ? Layer.empty
      : Layer.succeed(Tracer.Tracer, withConventionalSpanNames(tracer)),
  ),
).pipe(
  Layer.provide(OtlpTracer.layerFromConfig()),
  Layer.provide([OtlpSerialization.layerProtobuf, FetchHttpClient.layer]),
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
            environment: config.STACKS_ENV,
            // Sentry v11 collects cookies, user IPs, request/response bodies,
            // and database queries by default. Keep the v10 defaults so session
            // cookies and request payloads stay out of Sentry.
            // https://github.com/getsentry/sentry-javascript/blob/develop/MIGRATION.md#if-you-want-to-keep-the-v10-default-behavior
            dataCollection: {
              userInfo: false,
              cookies: false,
              httpHeaders: {
                request: {
                  deny: ["forwarded", "-ip", "remote-", "via", "-user"],
                },
                response: {
                  deny: ["forwarded", "-ip", "remote-", "via", "-user"],
                },
              },
              httpBodies: [],
              urlQueryParams: {
                deny: ["forwarded", "-ip", "remote-", "via", "-user"],
              },
              genAI: { inputs: false, outputs: false },
              databaseQueryData: false,
              queues: false,
              graphQL: { document: false, variables: false },
            },
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
          // Last, so when OTLP export is on its tracer replaces Sentry's:
          // Sentry still receives errors and logs.
          OtlpTracingLayer,
        );
      }

      return Layer.mergeAll(
        Logger.layer([consoleLogger, Logger.tracerLogger]),
        Layer.succeed(References.MinimumLogLevel, minLogLevel),
        OtlpTracingLayer,
      );
    }),
  );
