import { Data, Effect, Option } from "effect";
import sharp from "sharp";

export const WEBP = "image/webp";

export const PNG = "image/png";

export const JPEG = "image/jpeg";

export const allowedImageFormats = [WEBP, PNG, JPEG] as const;

export type AllowedImageFormat = (typeof allowedImageFormats)[number];

const allowedImageFormatSet: ReadonlySet<string> = new Set(allowedImageFormats);

export const isAllowedImageFormat = (
  contentType: string,
): contentType is AllowedImageFormat => allowedImageFormatSet.has(contentType);

export class ImageOptimizationError extends Data.TaggedError(
  "ImageOptimizationError",
)<{
  readonly cause: unknown;
  readonly message: string;
}> {}

/**
 * Upper bound on the number of pixels sharp is allowed to decode, guarding
 * against decompression bombs.
 */
export const MAX_INPUT_PIXELS = 50_000_000;

const mimeTypeBySharpFormat: ReadonlyMap<string, AllowedImageFormat> = new Map([
  ["jpeg", JPEG],
  ["png", PNG],
  ["webp", WEBP],
]);

export const mimeTypeForSharpFormat = (
  format: string,
): AllowedImageFormat | undefined => mimeTypeBySharpFormat.get(format);

/**
 * Reads the image header to detect the actual format, ignoring what the client
 * declared in the request `Content-Type`.
 *
 * Returns `None` when the bytes are not a readable image, and the sharp format
 * name (e.g. `png`, `gif`) otherwise.
 */
export const detectImageFormat = (
  buffer: Uint8Array,
): Effect.Effect<Option.Option<string>, ImageOptimizationError> =>
  Effect.tryPromise({
    try: async () =>
      Option.fromNullishOr((await sharp(buffer).metadata()).format),
    catch: (cause) =>
      new ImageOptimizationError({
        cause,
        message: cause instanceof Error ? cause.message : String(cause),
      }),
  });

export interface OptimizedImage {
  readonly buffer: Uint8Array;
  readonly height: number;
  readonly width: number;
}

export interface OptimizeImageOptions {
  readonly buffer: Uint8Array;
  readonly limitInputPixels?: number | undefined;
  readonly quality: number;
  readonly width: number;
}

/**
 * Re-encodes an image as WebP, resizing it to `width` without ever enlarging it.
 *
 * Mirrors the legacy server image pipeline so uploaded profile pictures keep
 * the same dimensions and quality.
 */
export const optimizeImage = ({
  buffer,
  limitInputPixels = MAX_INPUT_PIXELS,
  quality,
  width,
}: OptimizeImageOptions): Effect.Effect<
  OptimizedImage,
  ImageOptimizationError
> =>
  Effect.tryPromise({
    try: async () => {
      const { data, info } = await sharp(buffer, {
        limitInputPixels,
        sequentialRead: true,
      })
        .rotate()
        .resize(width, undefined, { withoutEnlargement: true })
        .webp({ quality, effort: 6, smartSubsample: true })
        .toBuffer({ resolveWithObject: true });

      return {
        buffer: new Uint8Array(data),
        height: info.height,
        width: info.width,
      };
    },
    catch: (cause) =>
      new ImageOptimizationError({
        cause,
        message: cause instanceof Error ? cause.message : String(cause),
      }),
  });
