import { Context, Effect, Layer, Option, Redacted } from "effect";
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

export interface PostHogClient {
  readonly capture: (event: PostHogEvent) => Effect.Effect<void>;
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
          };
        }

        const apiKey = Redacted.value(config.POSTHOG_API_KEY.value);
        const host = Option.getOrUndefined(config.POSTHOG_API_HOST);

        const client = yield* Effect.acquireRelease(
          Effect.sync(
            () =>
              new PostHog(apiKey, {
                host,
              }),
          ),
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
            }),
        };
      }),
    );

  static readonly layerTest = (
    recordedEvents: Array<PostHogEvent> = [],
  ): Layer.Layer<PostHogService> =>
    Layer.succeed(PostHogService, {
      capture: (event) =>
        Effect.sync(() => {
          recordedEvents.push(event);
        }),
    });
}
