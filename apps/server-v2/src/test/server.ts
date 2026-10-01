import { NodeHttpServer } from "@effect/platform-node";
import { Layer } from "effect";
import { HttpRouter } from "effect/http";
import { AppConfig, type AppConfigValues } from "@/config";
import { ApiRoutesLayer } from "@/main";
import { ArweaveService } from "@/services/arweave";
import { ImageProcessingService } from "@/services/image-processing";
import { PostHogService, type PostHogEvent } from "@/services/posthog";
import { RateLimiterTest } from "@/services/rate-limiter";
import { StorageService } from "@/services/storage";
import { TestDatabaseLayer } from "@/test/layer";

export interface TestServerLayers {
  readonly arweave?: Layer.Layer<ArweaveService>;
  readonly storage?: Layer.Layer<StorageService>;
}

export const makeTestServerLayer = (
  overrides: Partial<AppConfigValues> = {},
  posthogEvents: Array<PostHogEvent> = [],
  layers: TestServerLayers = {},
) =>
  HttpRouter.serve(ApiRoutesLayer, {
    disableListenLog: true,
    disableLogger: true,
  }).pipe(
    Layer.provideMerge(NodeHttpServer.layerTest),
    Layer.provide(RateLimiterTest),
    Layer.provideMerge(TestDatabaseLayer),
    Layer.provideMerge(AppConfig.layerTest(overrides)),
    Layer.provide(PostHogService.layerTest(posthogEvents)),
    Layer.provide(ImageProcessingService.layer),
    Layer.provide(layers.arweave ?? ArweaveService.layerTest()),
    Layer.provide(layers.storage ?? StorageService.layerTest()),
  );
