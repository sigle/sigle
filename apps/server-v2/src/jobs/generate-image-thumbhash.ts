import { eq } from "drizzle-orm";
import { Data, Effect, Layer, Option, Schedule, Schema } from "effect";
import { BlockList, isIPv4, isIPv6 } from "node:net";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { mediaImage } from "@/db/schema";
import {
  detectImageFormat,
  type ImageOptimizationError,
  mimeTypeForSharpFormat,
  resolveImageUrl,
} from "@/lib/images";
import { defineJob, terminal, type TerminalJobError } from "@/queue/core";
import {
  ImageProcessingService,
  type ImageProcessingTimeoutError,
} from "@/services/image-processing";

export const GENERATE_IMAGE_THUMBHASH_QUEUE_NAME = "generate-image-thumbhash";

export const GENERATE_IMAGE_THUMBHASH_MAX_ATTEMPTS = 3;

/**
 * Upper bound on the bytes downloaded for a single image. Remote images are
 * untrusted, so a huge body is treated as permanently invalid instead of being
 * retried.
 */
export const GENERATE_IMAGE_THUMBHASH_MAX_BYTES = 10 * 1024 * 1024;

const FETCH_TIMEOUT_MILLIS = 30_000;

const MAX_IMAGE_REDIRECTS = 3;

const redirectStatuses = new Set([301, 302, 303, 307, 308]);

const privateHostnames = new Set(["localhost", "localhost.localdomain"]);

const blockedAddresses = new BlockList();

for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  blockedAddresses.addSubnet(network, prefix, "ipv4");
}

for (const [network, prefix] of [
  ["::", 96],
  ["64:ff9b::", 96],
  ["100::", 64],
  ["2001:db8::", 32],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
] as const) {
  blockedAddresses.addSubnet(network, prefix, "ipv6");
}

interface IpLiteral {
  readonly address: string;
  readonly family: "ipv4" | "ipv6";
}

const parseIpLiteral = (hostname: string): IpLiteral | null => {
  const address =
    hostname.startsWith("[") && hostname.endsWith("]")
      ? hostname.slice(1, -1)
      : hostname;

  if (isIPv4(address)) {
    return { address, family: "ipv4" };
  }

  if (isIPv6(address)) {
    const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(address);

    if (mapped?.[1] !== undefined && isIPv4(mapped[1])) {
      return { address: mapped[1], family: "ipv4" };
    }

    return { address, family: "ipv6" };
  }

  return null;
};

const rejectUrl = (message: string) =>
  Effect.fail(terminal(new InvalidImageError({ message })));

/**
 * Restricts remote fetches to https URLs whose host is not a loopback,
 * link-local, private or reserved address. Hostnames are not DNS-resolved
 * here; pinning resolved addresses would require a custom dispatcher.
 */
const validateImageUrl = (
  rawUrl: string,
): Effect.Effect<URL, TerminalJobError> =>
  Effect.gen(function* () {
    const parsed = yield* Effect.try({
      try: () => new URL(rawUrl),
      catch: () =>
        terminal(
          new InvalidImageError({ message: `Invalid image URL: ${rawUrl}` }),
        ),
    });

    if (parsed.protocol !== "https:") {
      return yield* rejectUrl(`Image URL must use https: ${rawUrl}`);
    }

    const hostname = parsed.hostname.toLowerCase();
    // A trailing dot is equivalent to the bare name (`localhost.`), so strip
    // it before matching.
    const normalizedHostname = hostname.replace(/\.+$/, "");
    const literal = parseIpLiteral(normalizedHostname);

    if (literal !== null) {
      if (blockedAddresses.check(literal.address, literal.family)) {
        return yield* rejectUrl(
          `Image host address is not allowed: ${hostname}`,
        );
      }

      return parsed;
    }

    if (
      !normalizedHostname.includes(".") ||
      privateHostnames.has(normalizedHostname) ||
      normalizedHostname.endsWith(".localhost")
    ) {
      return yield* rejectUrl(`Image host is not allowed: ${hostname}`);
    }

    return parsed;
  });

/**
 * Follows a bounded number of redirects manually so every hop is revalidated
 * by `validateImageUrl` instead of trusting the redirect of a gateway.
 */
const fetchImageResponse = (
  initialUrl: string,
): Effect.Effect<Response, ImageFetchError | TerminalJobError> =>
  Effect.gen(function* () {
    let url = initialUrl;
    let response: Response | null = null;

    for (let redirects = 0; redirects <= MAX_IMAGE_REDIRECTS; redirects++) {
      const target = yield* validateImageUrl(url);

      const current = yield* Effect.tryPromise({
        try: () =>
          fetch(target, {
            redirect: "manual",
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MILLIS),
          }),
        catch: (cause) =>
          new ImageFetchError({
            cause,
            message: `Failed to fetch image: ${describeCause(cause)}`,
          }),
      });

      const location = redirectStatuses.has(current.status)
        ? current.headers.get("location")
        : null;

      if (location === null) {
        response = current;
        break;
      }

      if (redirects === MAX_IMAGE_REDIRECTS) {
        return yield* rejectUrl(`Too many redirects: ${initialUrl}`);
      }

      url = yield* Effect.try({
        try: () => new URL(location, target).toString(),
        catch: () =>
          terminal(
            new InvalidImageError({
              message: `Invalid image redirect location: ${location}`,
            }),
          ),
      });
    }

    if (response === null) {
      return yield* rejectUrl(`Image not reachable: ${initialUrl}`);
    }

    return response;
  });

/**
 * Streams the response body, cancelling the reader as soon as the cumulative
 * size exceeds `maxBytes` so an oversized or unbounded body is never fully
 * buffered.
 */
const readBodyWithLimit = (response: Response, maxBytes: number) =>
  Effect.tryPromise({
    try: async () => {
      const body = response.body;

      if (body === null) {
        return { bytes: new Uint8Array(), tooLarge: false as const };
      }

      const reader = body.getReader();
      const chunks: Array<Uint8Array> = [];
      let total = 0;

      for (;;) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        total += value.byteLength;

        if (total > maxBytes) {
          await reader.cancel();

          return { bytes: new Uint8Array(), tooLarge: true as const };
        }

        chunks.push(value);
      }

      const bytes = new Uint8Array(total);
      let offset = 0;

      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }

      return { bytes, tooLarge: false as const };
    },
    catch: (cause) =>
      new ImageFetchError({
        cause,
        message: `Failed to read image body: ${describeCause(cause)}`,
      }),
  });

export const GenerateImageThumbhashJobSchema = Schema.Struct({
  imageId: Schema.String,
});

export type GenerateImageThumbhashJob =
  typeof GenerateImageThumbhashJobSchema.Type;

export const thumbhashJobId = (imageId: string): string =>
  `thumbhash:${imageId}`;

export class ImageFetchError extends Data.TaggedError("ImageFetchError")<{
  readonly cause: unknown;
  readonly message: string;
}> {}

class InvalidImageError extends Data.TaggedError("InvalidImageError")<{
  readonly message: string;
}> {}

const describeCause = (cause: unknown): string =>
  cause instanceof Error ? cause.message : String(cause);

export const processGenerateImageThumbhashJob = (
  job: GenerateImageThumbhashJob,
): Effect.Effect<
  void,
  | ImageFetchError
  | ImageOptimizationError
  | ImageProcessingTimeoutError
  | TerminalJobError,
  Database | AppConfig | ImageProcessingService
> =>
  Effect.gen(function* () {
    const db = yield* Database;
    const config = yield* AppConfig;
    const images = yield* ImageProcessingService;

    // Producers insert the row alongside the post/profile, but the job also
    // accepts bare offers by creating the row itself.
    yield* db
      .insert(mediaImage)
      .values({ id: job.imageId })
      .onConflictDoNothing()
      .pipe(Effect.orDie);

    const [row] = yield* db
      .select({
        status: mediaImage.status,
        thumbhash: mediaImage.thumbhash,
        mimeType: mediaImage.mimeType,
      })
      .from(mediaImage)
      .where(eq(mediaImage.id, job.imageId))
      .limit(1)
      .pipe(Effect.orDie);

    // Redeliveries and re-offers of an already processed image are no-ops.
    if (
      row === undefined ||
      (row.status === "READY" && row.thumbhash !== null)
    ) {
      return;
    }

    const url = resolveImageUrl(job.imageId, {
      arweave: config.ARWEAVE_GATEWAY_URL,
      ipfs: config.IPFS_GATEWAY_URL,
    });

    const response = yield* fetchImageResponse(url);

    // A missing image will never appear, so stop retrying it.
    if (response.status === 404 || response.status === 410) {
      return yield* terminal(
        new InvalidImageError({
          message: `Image not found: HTTP ${response.status}`,
        }),
      );
    }

    if (!response.ok) {
      return yield* new ImageFetchError({
        cause: response,
        message: `Failed to fetch image: HTTP ${response.status}`,
      });
    }

    const declaredSize = Number(response.headers.get("content-length") ?? "");

    if (
      Number.isFinite(declaredSize) &&
      declaredSize > GENERATE_IMAGE_THUMBHASH_MAX_BYTES
    ) {
      return yield* terminal(
        new InvalidImageError({
          message: `Image is too large: ${declaredSize} bytes`,
        }),
      );
    }

    const body = yield* readBodyWithLimit(
      response,
      GENERATE_IMAGE_THUMBHASH_MAX_BYTES,
    );

    if (body.tooLarge) {
      return yield* rejectUrl(
        `Image is too large: more than ${GENERATE_IMAGE_THUMBHASH_MAX_BYTES} bytes`,
      );
    }

    const buffer = body.bytes;

    const detected = yield* detectImageFormat(buffer).pipe(
      Effect.orElseSucceed(() => Option.none()),
    );

    if (Option.isNone(detected)) {
      return yield* terminal(
        new InvalidImageError({ message: "Image format not supported" }),
      );
    }

    const mimeType =
      mimeTypeForSharpFormat(detected.value) ??
      (detected.value === "gif" ? "image/gif" : null);

    const thumbhash = yield* images.generateThumbhash(buffer);

    yield* db
      .update(mediaImage)
      .set({
        height: thumbhash.height,
        mimeType: mimeType ?? row.mimeType,
        size: buffer.byteLength,
        status: "READY",
        thumbhash: thumbhash.thumbhash,
        updatedAt: new Date(),
        width: thumbhash.width,
      })
      .where(eq(mediaImage.id, job.imageId))
      .pipe(Effect.orDie);
  });

export const markImageThumbhashFailed = (
  job: GenerateImageThumbhashJob,
): Effect.Effect<void, never, Database> =>
  Effect.gen(function* () {
    const db = yield* Database;

    yield* db
      .update(mediaImage)
      .set({ status: "FAILED", updatedAt: new Date() })
      .where(eq(mediaImage.id, job.imageId))
      .pipe(
        Effect.retry({
          schedule: Schedule.exponential("100 millis"),
          times: 3,
        }),
        Effect.catchCause((cause) =>
          Effect.logError(
            `Failed to mark image ${job.imageId} thumbhash as FAILED`,
            cause,
          ),
        ),
      );
  });

export const generateImageThumbhashJob = defineJob({
  name: GENERATE_IMAGE_THUMBHASH_QUEUE_NAME,
  payload: GenerateImageThumbhashJobSchema,
  maxAttempts: GENERATE_IMAGE_THUMBHASH_MAX_ATTEMPTS,
  concurrency: 2,
  process: (job) => processGenerateImageThumbhashJob(job),
  onFinalFailure: (job) => markImageThumbhashFailed(job),
  reportPayload: (job) => ({ imageId: job.imageId }),
});

export const GenerateImageThumbhashWorkerLive = generateImageThumbhashJob
  .workerLayer()
  .pipe(Layer.provideMerge(generateImageThumbhashJob.layer));
