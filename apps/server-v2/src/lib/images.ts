import { Data, Effect } from "effect";
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

export interface OptimizeImageOptions {
  readonly buffer: Uint8Array;
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
  quality,
  width,
}: OptimizeImageOptions): Effect.Effect<Uint8Array, ImageOptimizationError> =>
  Effect.tryPromise({
    try: async () => {
      const optimized = await sharp(buffer, { sequentialRead: true })
        .rotate()
        .resize(width, undefined, { withoutEnlargement: true })
        .webp({ quality, effort: 6, smartSubsample: true })
        .toBuffer();

      return new Uint8Array(optimized);
    },
    catch: (cause) =>
      new ImageOptimizationError({
        cause,
        message: cause instanceof Error ? cause.message : String(cause),
      }),
  });
