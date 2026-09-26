import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { AppConfig } from "@/config";
import { type PostHogEvent, PostHogService } from "@/services/posthog";

describe("posthog service", () => {
  it.effect("records events in layerTest", () => {
    const events: Array<PostHogEvent> = [];

    return Effect.gen(function* () {
      const posthog = yield* PostHogService;

      yield* posthog.capture({
        distinctId: "SP123",
        event: "draft created",
        properties: { postId: "draft-1" },
      });

      expect(events).toStrictEqual([
        {
          distinctId: "SP123",
          event: "draft created",
          properties: { postId: "draft-1" },
        },
      ]);
    }).pipe(Effect.provide(PostHogService.layerTest(events)));
  });

  it.effect(
    "uses no-op implementation when POSTHOG_API_KEY is not configured",
    () =>
      Effect.gen(function* () {
        const posthog = yield* PostHogService;
        yield* posthog.capture({
          distinctId: "SP123",
          event: "draft deleted",
        });
      }).pipe(
        Effect.provide(PostHogService.layer),
        Effect.provide(AppConfig.layerTest()),
      ),
  );
});
