import {
  Context,
  Effect,
  type ErrorReporter,
  Layer,
  Option,
  Redacted,
} from "effect";
import { PostHog } from "posthog-node";
import { AppConfig } from "@/config";

export type PostHogPropertyValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ReadonlyArray<string | number | boolean>;

export type PostHogProperties = Readonly<Record<string, PostHogPropertyValue>>;

export interface PostHogEvent {
  readonly distinctId: string;
  readonly event: string;
  readonly properties?: PostHogProperties | undefined;
}

/** Properties of a reported error: its `ErrorReporter` attributes. */
export type ExceptionProperties = ReturnType<
  typeof ErrorReporter.getAttributes
>;

export interface PostHogClient {
  readonly capture: (event: PostHogEvent) => Effect.Effect<void>;
  /** Reports an error to PostHog error tracking, not tied to a user. */
  readonly captureException: (
    error: Error,
    properties: ExceptionProperties,
  ) => Effect.Effect<void>;
}

export interface CapturedException {
  readonly error: Error;
  readonly properties: ExceptionProperties;
}

export class PostHogService extends Context.Service<
  PostHogService,
  PostHogClient
>()("sigle/PostHogService") {
  static readonly layer: Layer.Layer<PostHogService, never, AppConfig> =
    Layer.effect(
      PostHogService,
      Effect.gen(function* () {
        const config = yield* AppConfig;

        if (Option.isNone(config.POSTHOG_API_KEY)) {
          return {
            capture: () => Effect.void,
            captureException: () => Effect.void,
          };
        }

        const apiKey = Redacted.value(config.POSTHOG_API_KEY.value);
        const host = Option.getOrUndefined(config.POSTHOG_API_HOST);
        const context = yield* Effect.context<never>();

        const client = yield* Effect.acquireRelease(
          Effect.sync(() => {
            const instance = new PostHog(apiKey, { host });

            // Events the SDK couldn't deliver, after its retries, are only
            // reported here: `flush()` and `shutdown()` don't reject.
            instance.on("error", (error) => {
              Effect.runForkWith(context)(
                Effect.logWarning("Failed to deliver PostHog events", error),
              );
            });

            return instance;
          }),
          (instance) =>
            Effect.promise(async () => {
              await instance.shutdown();
            }),
        );

        return {
          capture: (event: PostHogEvent) =>
            Effect.sync(() => {
              client.capture({
                distinctId: event.distinctId,
                event: event.event,
                properties: event.properties,
              });
            }).pipe(
              // Analytics must never fail the request it instruments.
              Effect.catchDefect((defect) =>
                Effect.logWarning("Failed to capture PostHog event", defect),
              ),
            ),
          captureException: (error, properties) =>
            Effect.sync(() => {
              client.captureException(error, {
                properties: { ...properties, environment: config.STACKS_ENV },
              });
            }).pipe(
              Effect.catchDefect((defect) =>
                Effect.logWarning(
                  "Failed to capture PostHog exception",
                  defect,
                ),
              ),
            ),
        };
      }),
    );

  static readonly layerTest = (
    recordedEvents: Array<PostHogEvent> = [],
    recordedExceptions: Array<CapturedException> = [],
  ): Layer.Layer<PostHogService> =>
    Layer.succeed(PostHogService, {
      capture: (event) =>
        Effect.sync(() => {
          recordedEvents.push(event);
        }),
      captureException: (error, properties) =>
        Effect.sync(() => {
          recordedExceptions.push({ error, properties });
        }),
    });
}
