import type { Metadata } from "sharp";
import { Data, Effect, Option } from "effect";
import sharp from "sharp";
import { rgbaToThumbHash } from "thumbhash";

export const WEBP = "image/webp";

export const PNG = "image/png";

export const JPEG = "image/jpeg";

export interface ImageGateways {
  readonly arweave: string;
  readonly ipfs: string;
}

/**
 * Resolves an `ipfs://` or `ar://` URL to its gateway URL. Other URLs are
 * returned unchanged.
 */
export const resolveImageUrl = (
  image: string,
  gateways: ImageGateways,
): string => {
  if (image.startsWith("ipfs://")) {
    return `${gateways.ipfs.replace(/\/+$/, "")}/${image.slice(7)}`;
  }

  if (image.startsWith("ar://")) {
    return `${gateways.arweave.replace(/\/+$/, "")}/${image.slice(5)}`;
  }

  return image;
};

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
 * The decoded input is over `MAX_DECODED_INPUT_BYTES`, so processing it would
 * take more memory than one upload is allowed.
 */
export class ImageTooLargeError extends Data.TaggedError("ImageTooLargeError")<{
  readonly decodedBytes: number;
}> {}

const toImageOptimizationError = (cause: unknown) =>
  new ImageOptimizationError({
    cause,
    message: cause instanceof Error ? cause.message : String(cause),
  });

/**
 * Upper bound on the number of pixels sharp is allowed to decode, guarding
 * against decompression bombs.
 */
export const MAX_INPUT_PIXELS = 50_000_000;

/**
 * Upper bound on the size of the decoded input: width x height x channels x
 * bytes per sample.
 *
 * The pixel limit alone does not bound memory. Interlaced PNGs and progressive
 * JPEGs cannot be streamed, so libvips holds the whole decoded image, at peak
 * about twice this size, and a 16-bit RGBA image takes 8 bytes a pixel. This
 * limit keeps one pipeline, encode included, under a quarter of the 1 GB
 * production container, as two run at once.
 */
export const MAX_DECODED_INPUT_BYTES = 80 * 1024 * 1024;

const bytesPerSample: Record<Metadata["depth"], number> = {
  char: 1,
  uchar: 1,
  short: 2,
  ushort: 2,
  int: 4,
  uint: 4,
  float: 4,
  complex: 8,
  double: 8,
  dpcomplex: 16,
};

const decodedBytes = (metadata: Metadata): number =>
  metadata.width *
  metadata.height *
  metadata.channels *
  bytesPerSample[metadata.depth];

/**
 * Time budget for a single sharp pipeline, applied natively by libvips so
 * long-running work is stopped instead of only being abandoned by the caller.
 */
export const IMAGE_PROCESSING_TIMEOUT_SECONDS = 10;

const mimeTypeBySharpFormat: ReadonlyMap<string, AllowedImageFormat> = new Map([
  ["jpeg", JPEG],
  ["png", PNG],
  ["webp", WEBP],
]);

export const mimeTypeForSharpFormat = (
  format: string,
): AllowedImageFormat | undefined => mimeTypeBySharpFormat.get(format);

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];

// "GIF8", then "7a" or "9a".
const GIF_SIGNATURE = [0x47, 0x49, 0x46, 0x38];

// "RIFF", the chunk size, then "WEBP".
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46];

const WEBP_SIGNATURE = [0x57, 0x45, 0x42, 0x50];

const hasBytesAt = (
  buffer: Uint8Array,
  offset: number,
  bytes: ReadonlyArray<number>,
): boolean => bytes.every((byte, index) => buffer[offset + index] === byte);

/**
 * Whether the buffer starts like a PNG, JPEG, GIF or WebP. Nothing else is
 * handed to sharp: libvips also reads SVG, TIFF, HEIF and more, and parses a
 * whole SVG with librsvg just to read its header, which for a 10 MiB SVG takes
 * about a second and hundreds of MiB.
 */
const hasRasterSignature = (buffer: Uint8Array): boolean =>
  hasBytesAt(buffer, 0, PNG_SIGNATURE) ||
  hasBytesAt(buffer, 0, JPEG_SIGNATURE) ||
  hasBytesAt(buffer, 0, GIF_SIGNATURE) ||
  (hasBytesAt(buffer, 0, RIFF_SIGNATURE) &&
    hasBytesAt(buffer, 8, WEBP_SIGNATURE));

/**
 * Reads the image header to detect the actual format, ignoring what the client
 * declared in the request `Content-Type`.
 *
 * Returns `None` when the bytes are not a PNG, JPEG, GIF or WebP image, and
 * the sharp format name (e.g. `png`, `gif`) otherwise.
 */
export const detectImageFormat = (
  buffer: Uint8Array,
  {
    limitInputPixels = MAX_INPUT_PIXELS,
  }: { readonly limitInputPixels?: number | undefined } = {},
): Effect.Effect<Option.Option<string>, ImageOptimizationError> =>
  hasRasterSignature(buffer)
    ? Effect.tryPromise({
        try: async () =>
          Option.fromNullishOr(
            (await sharp(buffer, { limitInputPixels }).metadata()).format,
          ),
        catch: toImageOptimizationError,
      })
    : Effect.succeedNone;

export interface OptimizedImage {
  readonly buffer: Uint8Array;
  readonly height: number;
  readonly width: number;
}

export interface ThumbhashResult {
  readonly thumbhash: string;
  readonly height: number;
  readonly width: number;
}

/**
 * ThumbHash expects an input image of at most 100px in either dimension.
 */
export const THUMBHASH_MAX_INPUT_SIZE = 100;

/**
 * Encodes a compact ThumbHash placeholder for an image, along with the
 * EXIF-orientation-aware dimensions of the original image so readers can lay
 * the image out before it loads.
 *
 * Inputs over `MAX_DECODED_INPUT_BYTES` are rejected with
 * `ImageTooLargeError` before anything is decoded.
 */
export const generateThumbhash = ({
  buffer,
  limitInputPixels = MAX_INPUT_PIXELS,
}: {
  readonly buffer: Uint8Array;
  readonly limitInputPixels?: number | undefined;
}): Effect.Effect<
  ThumbhashResult,
  ImageOptimizationError | ImageTooLargeError
> =>
  Effect.gen(function* () {
    const image = sharp(buffer, { limitInputPixels, sequentialRead: true });

    const metadata = yield* Effect.tryPromise({
      try: () => image.metadata(),
      catch: toImageOptimizationError,
    });

    const inputBytes = decodedBytes(metadata);

    if (inputBytes > MAX_DECODED_INPUT_BYTES) {
      return yield* new ImageTooLargeError({ decodedBytes: inputBytes });
    }

    const { data, info } = yield* Effect.tryPromise({
      try: () =>
        image
          .timeout({ seconds: IMAGE_PROCESSING_TIMEOUT_SECONDS })
          .rotate()
          .resize(THUMBHASH_MAX_INPUT_SIZE, THUMBHASH_MAX_INPUT_SIZE, {
            fit: "inside",
          })
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true }),
      catch: toImageOptimizationError,
    });

    return {
      thumbhash: Buffer.from(
        rgbaToThumbHash(info.width, info.height, data),
      ).toString("base64"),
      height: metadata.autoOrient.height,
      width: metadata.autoOrient.width,
    };
  });

export interface OptimizeImageOptions {
  readonly buffer: Uint8Array;
  readonly height: number;
  readonly limitInputPixels?: number | undefined;
  readonly quality: number;
  readonly width: number;
}

/**
 * Re-encodes an image as WebP, resizing it to fit inside `width` x `height`
 * without ever enlarging it.
 *
 * Both dimensions are bounded because the WebP encode costs about 24 bytes per
 * output pixel: bounding only the width let a tall image keep up to 16383
 * pixels of height. Inputs over `MAX_DECODED_INPUT_BYTES` are rejected with
 * `ImageTooLargeError` before anything is decoded.
 */
export const optimizeImage = ({
  buffer,
  height,
  limitInputPixels = MAX_INPUT_PIXELS,
  quality,
  width,
}: OptimizeImageOptions): Effect.Effect<
  OptimizedImage,
  ImageOptimizationError | ImageTooLargeError
> =>
  Effect.gen(function* () {
    const image = sharp(buffer, { limitInputPixels, sequentialRead: true });

    const metadata = yield* Effect.tryPromise({
      try: () => image.metadata(),
      catch: toImageOptimizationError,
    });

    const inputBytes = decodedBytes(metadata);

    if (inputBytes > MAX_DECODED_INPUT_BYTES) {
      return yield* new ImageTooLargeError({ decodedBytes: inputBytes });
    }

    const { data, info } = yield* Effect.tryPromise({
      try: () =>
        image
          .timeout({ seconds: IMAGE_PROCESSING_TIMEOUT_SECONDS })
          .rotate()
          .resize(width, height, { fit: "inside", withoutEnlargement: true })
          // Effort 6 doubles the encode memory and takes several times as
          // long.
          .webp({ quality, effort: 4, smartSubsample: true })
          .toBuffer({ resolveWithObject: true }),
      catch: toImageOptimizationError,
    });

    return {
      buffer: new Uint8Array(data),
      height: info.height,
      width: info.width,
    };
  });
