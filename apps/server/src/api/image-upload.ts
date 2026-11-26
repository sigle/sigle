import type { HttpServerError } from "effect/http";
import { ByteSize, Effect, Option, Predicate } from "effect";
import { HttpServerRequest } from "effect/http";
import type { StoredObject } from "@/services/storage";
import {
  BadRequest,
  InternalServerError,
  PayloadTooLarge,
  UnsupportedMediaType,
} from "@/api/schemas";
import { Database } from "@/db";
import { mediaImage } from "@/db/schema";
import { sha256Hex } from "@/lib/hash";
import {
  detectImageFormat,
  isAllowedImageFormat,
  mimeTypeForSharpFormat,
  WEBP,
} from "@/lib/images";
import { ImageProcessingService } from "@/services/image-processing";
import { StorageService } from "@/services/storage";

const normalizeContentType = (contentType: string): string =>
  contentType.split(";")[0]?.trim().toLowerCase() ?? "";

/**
 * `@effect/platform-node` fails the body read with this message once the
 * `MaxBodySize` limit is exceeded, wrapped in an `HttpServerError`.
 */
const MAX_BODY_SIZE_CAUSE_MESSAGE = "maxBytes exceeded";

const isBodyTooLargeError = (error: HttpServerError.HttpServerError): boolean =>
  Predicate.isTagged(error.reason, "RequestParseError") &&
  error.reason.cause instanceof Error &&
  error.reason.cause.message === MAX_BODY_SIZE_CAUSE_MESSAGE;

const tooLarge = (maxMib: number) =>
  new PayloadTooLarge({
    message: `Image is too large, maximum size is ${maxMib} MiB.`,
  });

const readImageBody = (
  request: HttpServerRequest.HttpServerRequest,
  maxMib: number,
) =>
  request.arrayBuffer.pipe(
    Effect.provideService(
      HttpServerRequest.MaxBodySize,
      ByteSize.mebibytes(maxMib),
    ),
    Effect.map((buffer) => new Uint8Array(buffer)),
    Effect.tapError((error) =>
      Effect.logWarning("Failed to read image body", { cause: error }),
    ),
    Effect.mapError((error) =>
      isBodyTooLargeError(error)
        ? tooLarge(maxMib)
        : new BadRequest({ message: "Failed to read request body." }),
    ),
  );

export interface ImageUploadOptions {
  readonly maxMib: number;
  readonly quality: number;
  readonly width: number;
  /** Object key of the optimized image, given its content hash. */
  readonly key: (version: string) => string;
  /** Public URL of the stored image, also used as the `media_image` id. */
  readonly url: (stored: StoredObject) => string;
}

export interface UploadedImage {
  readonly height: number;
  readonly key: string;
  readonly sizeBytes: number;
  readonly thumbhash: string;
  readonly url: string;
  readonly width: number;
}

/**
 * Reads a raw image request body, re-encodes it as WebP, stores it in object
 * storage and records its placeholder metadata as a READY `media_image` row.
 *
 * The declared `Content-Type` and the detected format must both be an allowed
 * image format, and the body must fit in `maxMib`.
 */
export const uploadImageFromRequest = (
  request: HttpServerRequest.HttpServerRequest,
  options: ImageUploadOptions,
) =>
  Effect.gen(function* () {
    const db = yield* Database;
    const storage = yield* StorageService;
    const images = yield* ImageProcessingService;

    const contentType = normalizeContentType(
      request.headers["content-type"] ?? "",
    );

    if (!isAllowedImageFormat(contentType)) {
      return yield* new UnsupportedMediaType({
        message: `Unsupported image format: ${contentType}`,
      });
    }

    const declaredSize = Number(request.headers["content-length"] ?? "");

    if (
      Number.isFinite(declaredSize) &&
      declaredSize > options.maxMib * 1024 * 1024
    ) {
      return yield* tooLarge(options.maxMib);
    }

    const buffer = yield* readImageBody(request, options.maxMib);

    if (buffer.length === 0) {
      return yield* new BadRequest({ message: "No image provided" });
    }

    const detected = yield* detectImageFormat(buffer).pipe(
      Effect.orElseSucceed(() => Option.none()),
    );

    if (Option.isNone(detected)) {
      return yield* new UnsupportedMediaType({ message: "Invalid image file" });
    }

    if (mimeTypeForSharpFormat(detected.value) === undefined) {
      return yield* new UnsupportedMediaType({
        message: `Unsupported image format: ${detected.value}`,
      });
    }

    const optimized = yield* images
      .optimize({ buffer, quality: options.quality, width: options.width })
      .pipe(
        Effect.tapError((error) =>
          Effect.logWarning("Failed to optimize image", {
            cause: error,
            contentType,
          }),
        ),
        Effect.mapError((error) =>
          Predicate.isTagged(error, "ImageProcessingTimeoutError")
            ? new InternalServerError({
                message: "Image processing timed out.",
              })
            : new BadRequest({ message: "Failed to optimize image." }),
        ),
      );

    const version = sha256Hex(optimized.buffer);
    const key = options.key(version);

    // The image bytes are in hand, so the placeholder is computed inline
    // instead of going through the thumbhash queue. It runs before the upload
    // so a failure leaves nothing in object storage.
    const generated = yield* images.generateThumbhash(optimized.buffer).pipe(
      Effect.tapError((error) =>
        Effect.logWarning("Failed to generate image thumbhash", {
          cause: error,
          key,
        }),
      ),
      Effect.mapError(
        () =>
          new InternalServerError({
            message: "Failed to generate image placeholder.",
          }),
      ),
    );

    const stored = yield* storage
      .uploadFile({ body: optimized.buffer, contentType: WEBP, key, version })
      .pipe(
        // StorageService logs the cause, the client only gets a generic message.
        Effect.mapError(
          () => new InternalServerError({ message: "Failed to upload image." }),
        ),
      );

    const url = options.url(stored);

    const mediaFields = {
      height: optimized.height,
      mimeType: WEBP,
      size: optimized.buffer.length,
      status: "READY" as const,
      thumbhash: generated.thumbhash,
      updatedAt: new Date(),
      width: optimized.width,
    };

    yield* db
      .insert(mediaImage)
      .values({ id: url, ...mediaFields })
      .onConflictDoUpdate({ target: mediaImage.id, set: mediaFields })
      .pipe(Effect.orDie);

    return {
      height: optimized.height,
      key,
      sizeBytes: optimized.buffer.length,
      thumbhash: generated.thumbhash,
      url,
      width: optimized.width,
    } satisfies UploadedImage;
  });
