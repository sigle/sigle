import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import sharp from "sharp";
import {
  ImageOptimizationError,
  isAllowedImageFormat,
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

describe("images", () => {
  it.effect(
    "optimizes an image to webp and resizes it down to the target width",
    () =>
      Effect.gen(function* () {
        const png = yield* Effect.promise(() => makePng(64, 32));

        const optimized = yield* optimizeImage({
          buffer: new Uint8Array(png),
          quality: 75,
          width: 32,
        });

        const metadata = yield* Effect.promise(() =>
          sharp(Buffer.from(optimized)).metadata(),
        );

        expect({
          format: metadata.format,
          width: metadata.width,
          height: metadata.height,
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
        quality: 75,
        width: 1000,
      });

      const metadata = yield* Effect.promise(() =>
        sharp(Buffer.from(optimized)).metadata(),
      );

      expect({
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
      }).toStrictEqual({
        format: "webp",
        width: 32,
        height: 16,
      });
    }),
  );

  it.effect("wraps invalid images in ImageOptimizationError", () =>
    Effect.gen(function* () {
      const error = yield* optimizeImage({
        buffer: new Uint8Array([1, 2, 3]),
        quality: 75,
        width: 100,
      }).pipe(Effect.flip);

      expect(error).toBeInstanceOf(ImageOptimizationError);
      expect(error._tag).toBe("ImageOptimizationError");
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
