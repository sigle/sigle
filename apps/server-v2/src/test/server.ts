import { NodeHttpServer } from "@effect/platform-node";
import { Layer } from "effect";
import { HttpRouter } from "effect/unstable/http";
import { AppConfig, type AppConfigValues } from "@/config";
import { ApiRoutesLayer } from "@/main";
import { RateLimiterTest } from "@/services/rate-limiter";
import { TestDatabaseLayer } from "@/test/layer";

export const makeTestServerLayer = (overrides: Partial<AppConfigValues> = {}) =>
  HttpRouter.serve(ApiRoutesLayer, {
    disableListenLog: true,
    disableLogger: true,
  }).pipe(
    Layer.provideMerge(NodeHttpServer.layerTest),
    Layer.provide(RateLimiterTest),
    Layer.provideMerge(TestDatabaseLayer),
    Layer.provide(AppConfig.layerTest(overrides)),
  );
