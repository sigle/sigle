import {
  NodeHttpServer,
  NodeRuntime,
  NodeServices,
} from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { HttpRouter } from "effect/unstable/http";
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi";
import { createServer } from "node:http";
import { SigleApi } from "@/api";
import { HealthHandlersLayer } from "@/api/handlers/health";
import { RateLimitMiddlewareLayer } from "@/api/middleware/rate-limit";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { PostHogService } from "@/services/posthog";
import { RateLimiterLive } from "@/services/rate-limiter";
import { TelemetryLayer } from "@/services/telemetry";

export const CoreServicesLayer = Layer.mergeAll(
  AppConfig.layer,
  TelemetryLayer,
  PostHogService.layer,
).pipe(Layer.provideMerge(AppConfig.layer), Layer.provide(NodeServices.layer));

export const ApiHandlersLayer = HealthHandlersLayer;

export const CorsLayer = Layer.unwrap(
  Effect.map(AppConfig, (config) =>
    HttpRouter.cors({
      allowedOrigins: [config.APP_URL],
      credentials: true,
    }),
  ),
);

export const ApiRoutesLayer = Layer.mergeAll(
  HttpApiBuilder.layer(SigleApi, { openapiPath: "/_openapi.json" }),
  HttpApiScalar.layer(SigleApi, { path: "/_scalar" }),
  CorsLayer,
).pipe(
  Layer.provide(ApiHandlersLayer),
  Layer.provide(RateLimitMiddlewareLayer),
);

export const HttpServerLayer = Layer.unwrap(
  Effect.gen(function* () {
    const config = yield* AppConfig;

    return HttpRouter.serve(ApiRoutesLayer).pipe(
      Layer.provide(NodeHttpServer.layer(createServer, { port: config.PORT })),
    );
  }),
);

export const MainLayer = HttpServerLayer.pipe(
  Layer.provide(RateLimiterLive),
  Layer.provide(Database.layer),
);

export const startupProgram = Effect.gen(function* () {
  const config = yield* AppConfig;
  yield* Effect.logInfo("Sigle server-v2 initialized", {
    env: config.SIGLE_ENV,
    stacksEnv: config.STACKS_ENV,
    port: config.PORT,
  });
});

if (import.meta.main) {
  startupProgram.pipe(
    Effect.andThen(Layer.launch(MainLayer)),
    Effect.provide(CoreServicesLayer),
    NodeRuntime.runMain,
  );
}
