import { eq } from "drizzle-orm";
import {
  Context,
  Data,
  Effect,
  Layer,
  Option,
  Predicate,
  Schedule,
  Schema,
} from "effect";
import type { ImageOptimizationError } from "@/lib/images";
import type { TerminalJobError } from "@/queue/core";
import type {
  ImageProcessingBusyError,
  ImageProcessingTimeoutError,
} from "@/services/image-processing";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { mediaImage } from "@/db/schema";
import {
  detectImageFormat,
  mimeTypeForSharpFormat,
  resolveImageUrl,
} from "@/lib/images";
import {
  fetchPublicHttps,
  isBlockedAddress,
  parseIpLiteral,
} from "@/lib/public-https";
import { defineJob, terminal } from "@/queue/core";
import { ImageProcessingService } from "@/services/image-processing";

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

const rejectUrl = (message: string) =>
  Effect.fail(terminal(new InvalidImageError({ message })));

/**
 * Restricts remote fetches to https URLs whose host is not a loopback,
 * link-local, private or reserved address. A hostname is checked again when
 * connecting, against the addresses it resolves to (`fetchPublicHttps`).
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
      if (isBlockedAddress(literal)) {
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
 * How the job downloads an image: `fetchPublicHttps`, which refuses a
 * hostname that resolves to a blocked address. Tests replace it.
 */
export const ImageFetch = Context.Reference<
  (url: URL, init: { readonly signal: AbortSignal }) => Promise<Response>
>("sigle/ImageFetch", { defaultValue: () => fetchPublicHttps });

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
    const imageFetch = yield* ImageFetch;

    for (let redirects = 0; redirects <= MAX_IMAGE_REDIRECTS; redirects++) {
      const target = yield* validateImageUrl(url);

      const current = yield* Effect.tryPromise({
        try: () =>
          imageFetch(target, {
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MILLIS),
          }),
        catch: (cause) =>
          Predicate.isTagged(cause, "BlockedAddressError")
            ? terminal(
                new InvalidImageError({
                  message: `Image host address is not allowed: ${describeCause(cause)}`,
                }),
              )
            : new ImageFetchError({
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
  | ImageProcessingBusyError
  | ImageProcessingTimeoutError
  | TerminalJobError,
  Database | AppConfig | ImageProcessingService
> =>
  Effect.gen(function* () {
    const db = yield* Database;
    const config = yield* AppConfig;
    const images = yield* ImageProcessingService;

    // Producers insert the row alongside the post, but the job also
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

    // The formats the upload endpoints accept, and GIF, which a cover may be.
    // Nothing else is rendered: an SVG would escape the pixel limit and the
    // processing timeout.
    const mimeType = Option.match(detected, {
      onNone: () => undefined,
      onSome: (format) =>
        format === "gif" ? "image/gif" : mimeTypeForSharpFormat(format),
    });

    if (mimeType === undefined) {
      return yield* terminal(
        new InvalidImageError({ message: "Image format not supported" }),
      );
    }

    const thumbhash = yield* images.generateThumbhash(buffer).pipe(
      Effect.catchTag("ImageTooLargeError", (error) =>
        Effect.fail(
          terminal(
            new InvalidImageError({
              message: `Image is too large to decode: ${error.decodedBytes} bytes`,
            }),
          ),
        ),
      ),
    );

    yield* db
      .update(mediaImage)
      .set({
        height: thumbhash.height,
        mimeType,
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
