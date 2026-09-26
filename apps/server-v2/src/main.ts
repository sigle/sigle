import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { AppConfig } from "@/config";
import { PostHogService } from "@/services/posthog";
import { TelemetryLayer } from "@/services/telemetry";

export const CoreServicesLayer = Layer.mergeAll(
  AppConfig.layer,
  TelemetryLayer,
  PostHogService.layer,
).pipe(Layer.provideMerge(AppConfig.layer), Layer.provide(NodeServices.layer));

export const startupProgram = Effect.gen(function* () {
  const config = yield* AppConfig;
  yield* Effect.logInfo("Sigle server-v2 initialized", {
    env: config.SIGLE_ENV,
    stacksEnv: config.STACKS_ENV,
    port: config.PORT,
  });
});

if (import.meta.main) {
  startupProgram.pipe(Effect.provide(CoreServicesLayer), NodeRuntime.runMain);
}
