import {
  NodeHttpServer,
  NodeRuntime,
  NodeServices,
} from "@effect/platform-node";
import { Cause, Effect, Exit, Layer, Runtime } from "effect";
import { HttpRouter } from "effect/http";
import { HttpApiBuilder, HttpApiScalar, OpenApi } from "effect/http-api";
import { createServer } from "node:http";
import { SigleApi } from "@/api";
import { AuthRoutesLayer } from "@/api/groups/auth";
import { AdminHandlersLayer } from "@/api/handlers/admin";
import { DraftsHandlersLayer } from "@/api/handlers/drafts";
import { HealthHandlersLayer } from "@/api/handlers/health";
import { MeHandlersLayer } from "@/api/handlers/me";
import { PostsHandlersLayer } from "@/api/handlers/posts";
import { ProfileHandlersLayer } from "@/api/handlers/profile";
import { UsersHandlersLayer } from "@/api/handlers/users";
import { AdminMiddlewareLayer } from "@/api/middleware/admin";
import {
  UserAuthMiddlewareLayer,
  WhitelistedUserMiddlewareLayer,
} from "@/api/middleware/auth-user";
import { EtagLayer } from "@/api/middleware/etag";
import { RateLimitMiddlewareLayer } from "@/api/middleware/rate-limit";
import { SchemaErrorMiddlewareLayer } from "@/api/middleware/schema-error";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { JobsLive } from "@/jobs";
import { ArweaveService } from "@/services/arweave";
import { AuthService } from "@/services/auth";
import { ImageProcessingService } from "@/services/image-processing";
import { OpenTimestampsService } from "@/services/opentimestamps";
import { PlanService } from "@/services/plan";
import { PostHogService } from "@/services/posthog";
import { RateLimiterLive } from "@/services/rate-limiter";
import { StorageService } from "@/services/storage";
import { TelemetryLayer } from "@/services/telemetry";

export const CoreServicesLayer = Layer.mergeAll(
  TelemetryLayer,
  PostHogService.layer,
  ArweaveService.layer,
  OpenTimestampsService.layer,
  ImageProcessingService.layer,
  StorageService.layer,
).pipe(Layer.provideMerge(AppConfig.layer), Layer.provide(NodeServices.layer));

export const ApiHandlersLayer = Layer.mergeAll(
  HealthHandlersLayer,
  MeHandlersLayer,
  DraftsHandlersLayer,
  ProfileHandlersLayer,
  UsersHandlersLayer,
  PostsHandlersLayer,
  AdminHandlersLayer,
);

export const ApiMiddlewareLayer = Layer.mergeAll(
  RateLimitMiddlewareLayer,
  UserAuthMiddlewareLayer,
  WhitelistedUserMiddlewareLayer,
  AdminMiddlewareLayer,
  SchemaErrorMiddlewareLayer,
);

export const AuthLayer = Layer.mergeAll(AuthService.layer, PlanService.layer);

export const CorsLayer = Layer.unwrap(
  Effect.map(AppConfig, (config) =>
    HttpRouter.cors({
      allowedOrigins: [config.APP_URL],
      credentials: true,
      // Browsers only let cross-origin pages read CORS-safelisted response
      // headers unless they are exposed.
      exposedHeaders: [
        "location",
        "etag",
        "retry-after",
        "x-ratelimit-limit",
        "x-ratelimit-remaining",
        "x-ratelimit-reset",
      ],
    }),
  ),
);

// The served spec lists this deployment's URL as its server. It is only known
// from the config, so it is added here rather than on `SigleApi`.
const ServedApiLayer = Layer.unwrap(
  Effect.map(AppConfig, (config) => {
    const api = SigleApi.annotate(OpenApi.Servers, [
      { url: config.API_URL, description: config.STACKS_ENV },
    ]);

    return Layer.mergeAll(
      HttpApiBuilder.layer(api, { openapiPath: "/_openapi.json" }),
      HttpApiScalar.layer(api, { path: "/_scalar" }),
    );
  }),
);

export const ApiRoutesLayer = Layer.mergeAll(
  ServedApiLayer,
  AuthRoutesLayer,
  CorsLayer,
  EtagLayer,
).pipe(Layer.provide(ApiHandlersLayer), Layer.provide(ApiMiddlewareLayer));

export const HttpServerLayer = Layer.unwrap(
  Effect.gen(function* () {
    const config = yield* AppConfig;

    return HttpRouter.serve(ApiRoutesLayer).pipe(
      Layer.provide(NodeHttpServer.layer(createServer, { port: config.PORT })),
    );
  }),
);

export const MainLayer = HttpServerLayer.pipe(
  Layer.provide(JobsLive),
  Layer.provide(AuthLayer),
  Layer.provide(RateLimiterLive),
  Layer.provide(Database.layer),
);

export const startupProgram = Effect.gen(function* () {
  const config = yield* AppConfig;
  yield* Effect.logInfo("Sigle server initialized", {
    stacksEnv: config.STACKS_ENV,
    port: config.PORT,
  });
});

/**
 * A stop signal (SIGTERM, SIGINT) ends the server with code 0 rather than
 * Effect's 130: Litestream, which runs the server in production (`start.sh`),
 * only syncs the last database changes after a server it stopped exits
 * cleanly. Railway sends SIGTERM on every deploy and before sleeping.
 */
const teardown: Runtime.Teardown = (exit, onExit) => {
  if (Exit.isFailure(exit) && Cause.hasInterruptsOnly(exit.cause)) {
    onExit(0);
  } else {
    Runtime.defaultTeardown(exit, onExit);
  }
};

if (import.meta.main) {
  startupProgram.pipe(
    Effect.andThen(Layer.launch(MainLayer)),
    Effect.provide(CoreServicesLayer),
    NodeRuntime.runMain({ teardown }),
  );
}
