import { NodeHttpServer } from "@effect/platform-node";
import { type Effect, Layer, Schedule } from "effect";
import { HttpRouter } from "effect/http";
import { AppConfig, type AppConfigValues } from "@/config";
import { makeQueuesTestLayer } from "@/jobs";
import { ApiRoutesLayer, AuthLayer } from "@/main";
import {
  ArweaveService,
  type ArweaveUploadError,
  type ArweaveUploadOptions,
  type ArweaveUploadResult,
} from "@/services/arweave";
import { ImageProcessingService } from "@/services/image-processing";
import { OpenTimestampsService } from "@/services/opentimestamps";
import { PostHogService, type PostHogEvent } from "@/services/posthog";
import { RateLimiterTest } from "@/services/rate-limiter";
import { StorageService } from "@/services/storage";
import { TestDatabaseLayer } from "@/test/layer";

export interface TestServerOptions {
  readonly arweave?: Layer.Layer<ArweaveService>;
  readonly storage?: Layer.Layer<StorageService>;
  readonly opentimestamps?: Layer.Layer<OpenTimestampsService>;
  readonly arweaveUploadImpl?: (
    options: ArweaveUploadOptions,
  ) => Effect.Effect<ArweaveUploadResult, ArweaveUploadError>;
  readonly pollInterval?: "15 millis" | "50 millis" | "10 seconds";
}

export const makeTestServerLayer = (
  overrides: Partial<AppConfigValues> = {},
  posthogEvents: Array<PostHogEvent> = [],
  options: TestServerOptions = {},
) =>
  HttpRouter.serve(ApiRoutesLayer, {
    disableListenLog: true,
    disableLogger: true,
  }).pipe(
    Layer.provideMerge(NodeHttpServer.layerTest),
    Layer.provideMerge(
      makeQueuesTestLayer({
        pollInterval: options.pollInterval ?? "15 millis",
        retrySchedule: Schedule.spaced("0 millis"),
        maxAttempts: 2,
      }),
    ),
    Layer.provide(AuthLayer),
    Layer.provide(RateLimiterTest),
    Layer.provideMerge(TestDatabaseLayer),
    Layer.provideMerge(AppConfig.layerTest(overrides)),
    Layer.provide(PostHogService.layerTest(posthogEvents)),
    Layer.provide(options.opentimestamps ?? OpenTimestampsService.layerTest()),
    Layer.provide(ImageProcessingService.layer),
    Layer.provide(
      options.arweave ??
        ArweaveService.layerTest([], options.arweaveUploadImpl),
    ),
    Layer.provide(options.storage ?? StorageService.layerTest()),
  );
