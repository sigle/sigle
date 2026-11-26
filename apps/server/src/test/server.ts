import type { Effect } from "effect";
import type { RateLimiter } from "effect/persistence";
import { NodeHttpServer } from "@effect/platform-node";
import { Layer, Schedule } from "effect";
import { HttpRouter } from "effect/http";
import type { AppConfigValues } from "@/config";
import type {
  ArweaveUploadError,
  ArweaveUploadOptions,
  ArweaveUploadResult,
} from "@/services/arweave";
import type { PostHogEvent } from "@/services/posthog";
import { AppConfig } from "@/config";
import { makeQueuesTestLayer } from "@/jobs";
import { ApiRoutesLayer, AuthLayer } from "@/main";
import { ArweaveService } from "@/services/arweave";
import { BnsService } from "@/services/bns";
import { ImageProcessingService } from "@/services/image-processing";
import { OpenTimestampsService } from "@/services/opentimestamps";
import { PostHogService } from "@/services/posthog";
import { RateLimiterLive } from "@/services/rate-limiter";
import { StorageService } from "@/services/storage";
import { TestDatabaseLayer } from "@/test/layer";

export interface TestServerOptions {
  readonly arweave?: Layer.Layer<ArweaveService>;
  readonly bns?: Layer.Layer<BnsService>;
  readonly storage?: Layer.Layer<StorageService>;
  readonly imageProcessing?: Layer.Layer<ImageProcessingService>;
  readonly opentimestamps?: Layer.Layer<OpenTimestampsService>;
  readonly arweaveUploadImpl?: (
    options: ArweaveUploadOptions,
  ) => Effect.Effect<ArweaveUploadResult, ArweaveUploadError>;
  readonly pollInterval?: "15 millis" | "50 millis" | "20 seconds";
  readonly rateLimiter?: Layer.Layer<RateLimiter.RateLimiter>;
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
    Layer.provide(options.rateLimiter ?? RateLimiterLive),
    Layer.provideMerge(TestDatabaseLayer),
    Layer.provideMerge(AppConfig.layerTest(overrides)),
    Layer.provide(PostHogService.layerTest(posthogEvents)),
    Layer.provide(options.opentimestamps ?? OpenTimestampsService.layerTest()),
    Layer.provide(options.imageProcessing ?? ImageProcessingService.layer),
    Layer.provide(
      options.arweave ??
        ArweaveService.layerTest([], options.arweaveUploadImpl),
    ),
    Layer.provide(options.storage ?? StorageService.layerTest()),
    Layer.provide(options.bns ?? BnsService.layerTest()),
  );
