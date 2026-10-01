import {
  NodeHttpServer,
  NodeRuntime,
  NodeServices,
} from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { HttpRouter } from "effect/http";
import { HttpApiBuilder, HttpApiScalar } from "effect/http-api";
import { createServer } from "node:http";
import { SigleApi } from "@/api";
import { AuthRoutesLayer } from "@/api/groups/auth";
import { AdminHandlersLayer } from "@/api/handlers/admin";
import { DraftsHandlersLayer } from "@/api/handlers/drafts";
import { HealthHandlersLayer } from "@/api/handlers/health";
import { ProfileHandlersLayer } from "@/api/handlers/profile";
import { ProtectedHandlersLayer } from "@/api/handlers/protected";
import { AdminMiddlewareLayer } from "@/api/middleware/admin";
import {
  UserAuthMiddlewareLayer,
  WhitelistedUserMiddlewareLayer,
} from "@/api/middleware/auth-user";
import { RateLimitMiddlewareLayer } from "@/api/middleware/rate-limit";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { JobsLive } from "@/jobs";
import { ArweaveService } from "@/services/arweave";
import { AuthService } from "@/services/auth";
import { ImageProcessingService } from "@/services/image-processing";
import { PostHogService } from "@/services/posthog";
import { RateLimiterLive } from "@/services/rate-limiter";
import { StorageService } from "@/services/storage";
import { TelemetryLayer } from "@/services/telemetry";
import { UserWhitelistService } from "@/services/users";

export const CoreServicesLayer = Layer.mergeAll(
  TelemetryLayer,
  PostHogService.layer,
  ArweaveService.layer,
  ImageProcessingService.layer,
  StorageService.layer,
).pipe(Layer.provideMerge(AppConfig.layer), Layer.provide(NodeServices.layer));

export const ApiHandlersLayer = Layer.mergeAll(
  HealthHandlersLayer,
  ProtectedHandlersLayer,
  DraftsHandlersLayer,
  ProfileHandlersLayer,
  AdminHandlersLayer,
);

export const ApiMiddlewareLayer = Layer.mergeAll(
  RateLimitMiddlewareLayer,
  UserAuthMiddlewareLayer,
  WhitelistedUserMiddlewareLayer,
  AdminMiddlewareLayer,
);

export const AuthLayer = Layer.mergeAll(
  AuthService.layer,
  UserWhitelistService.layer,
);

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
  AuthRoutesLayer,
  CorsLayer,
).pipe(
  Layer.provide(ApiHandlersLayer),
  Layer.provide(ApiMiddlewareLayer),
  Layer.provide(AuthLayer),
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
  Layer.provide(JobsLive),
  Layer.provide(ArweaveService.layer),
  Layer.provide(UserWhitelistService.layer),
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
