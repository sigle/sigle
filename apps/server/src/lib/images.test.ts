import { describe, expect, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { crc32, deflateSync } from "node:zlib";
import sharp from "sharp";
import {
  detectImageFormat,
  ImageOptimizationError,
  isAllowedImageFormat,
  mimeTypeForSharpFormat,
  optimizeImage,
} from "@/lib/images";

const makePng = (width: number, height: number) =>
  sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

const ONE_PIXEL_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

const pngChunk = (type: string, data: Buffer) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);

  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));

  return Buffer.concat([length, body, crc]);
};

/**
 * A PNG of a few bytes whose header declares `width` x `height` grayscale
 * pixels, to test pixel limits without encoding a large image.
 */
const makePngHeader = (width: number, height: number) => {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(Buffer.alloc(1))),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
};

describe("images", () => {
  it.effect("optimizes an image to webp and resizes it down", () =>
    Effect.gen(function* () {
      const png = yield* Effect.promise(() => makePng(64, 32));

      const optimized = yield* optimizeImage({
        buffer: new Uint8Array(png),
        height: 32,
        quality: 75,
        width: 32,
      });

      const metadata = yield* Effect.promise(() =>
        sharp(Buffer.from(optimized.buffer)).metadata(),
      );

      expect({
        format: metadata.format,
        width: optimized.width,
        height: optimized.height,
      }).toStrictEqual({
        format: "webp",
        width: 32,
        height: 16,
      });
    }),
  );

  it.effect("never enlarges an image smaller than the target width", () =>
    Effect.gen(function* () {
      const png = yield* Effect.promise(() => makePng(32, 16));

      const optimized = yield* optimizeImage({
        buffer: new Uint8Array(png),
        height: 1000,
        quality: 75,
        width: 1000,
      });

      expect({
        width: optimized.width,
        height: optimized.height,
      }).toStrictEqual({
        width: 32,
        height: 16,
      });
    }),
  );

  it.effect("wraps invalid images in ImageOptimizationError", () =>
    Effect.gen(function* () {
      const error = yield* optimizeImage({
        buffer: new Uint8Array([1, 2, 3]),
        height: 100,
        quality: 75,
        width: 100,
      }).pipe(Effect.flip);

      expect(error).toBeInstanceOf(ImageOptimizationError);
      expect(error._tag).toBe("ImageOptimizationError");
    }),
  );

  it.effect("rejects images above the pixel limit", () =>
    Effect.gen(function* () {
      const png = yield* Effect.promise(() => makePng(64, 32));

      const error = yield* optimizeImage({
        buffer: new Uint8Array(png),
        height: 32,
        limitInputPixels: 100,
        quality: 75,
        width: 32,
      }).pipe(Effect.flip);

      expect(error).toBeInstanceOf(ImageOptimizationError);
    }),
  );

  it.effect("rejects images above the default pixel limit on detection", () =>
    Effect.gen(function* () {
      // 8000 x 8000 is 64M pixels, above MAX_INPUT_PIXELS (50M).
      const error = yield* detectImageFormat(
        new Uint8Array(makePngHeader(8000, 8000)),
      ).pipe(Effect.flip);

      expect(error).toBeInstanceOf(ImageOptimizationError);
    }),
  );

  it.effect("detects the actual image format from the bytes", () =>
    Effect.gen(function* () {
      const png = yield* Effect.promise(() => makePng(16, 16));

      const pngFormat = Option.getOrNull(
        yield* detectImageFormat(new Uint8Array(png)),
      );

      const gifFormat = Option.getOrNull(
        yield* detectImageFormat(new Uint8Array(ONE_PIXEL_GIF)),
      );

      const invalidFormat = yield* detectImageFormat(
        new Uint8Array([1, 2, 3]),
      ).pipe(Effect.orElseSucceed(() => Option.none()));

      expect({
        png: pngFormat,
        pngMime: mimeTypeForSharpFormat(pngFormat ?? ""),
        gif: gifFormat,
        gifMime: mimeTypeForSharpFormat(gifFormat ?? ""),
        invalid: Option.isNone(invalidFormat),
      }).toStrictEqual({
        png: "png",
        pngMime: "image/png",
        gif: "gif",
        gifMime: undefined,
        invalid: true,
      });
    }),
  );

  it("only allows webp, png and jpeg content types", () => {
    expect({
      webp: isAllowedImageFormat("image/webp"),
      png: isAllowedImageFormat("image/png"),
      jpeg: isAllowedImageFormat("image/jpeg"),
      gif: isAllowedImageFormat("image/gif"),
    }).toStrictEqual({
      webp: true,
      png: true,
      jpeg: true,
      gif: false,
    });
  });
});
