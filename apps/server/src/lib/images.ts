import { Result, TaggedError } from "better-result";
import { encode } from "blurhash";
import sharp from "sharp";
import { env } from "../env";

export const resolveImageUrl = (image: string) => {
  if (image?.startsWith("ipfs://")) {
    const cid = image.slice(7);
    image = `${env.IPFS_GATEWAY_URL}/${cid}`;
  }
  if (image?.startsWith("ar://")) {
    image = `${env.ARWEAVE_GATEWAY_URL}/${image.slice(5)}`;
  }
  return image;
};

const WEBP = "image/webp";
const PNG = "image/png";
const JPEG = "image/jpeg";
export const allowedFormats = [WEBP, PNG, JPEG] as const;

export class ImageOptimizationFailedError extends TaggedError(
  "ImageOptimizationFailedError",
)<{
  cause: unknown;
}>() {}

export async function optimizeImage({
  buffer,
  quality,
  width,
  height,
}: {
  buffer: Buffer | ArrayBuffer;
  quality: number;
  width: number;
  height?: number;
}): Promise<Result<Buffer, ImageOptimizationFailedError>> {
  return Result.tryPromise({
    try: async () => {
      const transformer = sharp(buffer, {
        sequentialRead: true,
      });

      transformer.rotate();

      if (height) {
        transformer.resize(width, height);
      } else {
        transformer.resize(width, undefined, {
          withoutEnlargement: true,
        });
      }

      transformer.webp({ quality });

      const optimizedBuffer = await transformer.toBuffer();
      return optimizedBuffer;
    },
    catch: (cause) => new ImageOptimizationFailedError({ cause }),
  });
}

export function mimeTypeToExtension(mimeType: string): string {
  switch (mimeType) {
    case WEBP:
      return "webp";
    case PNG:
      return "png";
    case JPEG:
      return "jpeg";
  }
  throw new Error("Unsupported mimeType");
}

export class BlurhashGenerationFailedError extends TaggedError(
  "BlurhashGenerationFailedError",
)<{
  cause: unknown;
}>() {}

export async function generateBlurhash({
  buffer,
  size = 20,
}: {
  buffer: Buffer | ArrayBuffer;
  size?: number;
}): Promise<Result<string, BlurhashGenerationFailedError>> {
  return Result.tryPromise({
    try: async () => {
      return new Promise<string>((resolve, reject) => {
        sharp(buffer)
          .raw()
          .ensureAlpha()
          .resize(size, size, { fit: "inside" })
          .toBuffer((err, buffer, { width, height }) => {
            if (err) return reject(err);
            const hash = encode(
              new Uint8ClampedArray(buffer),
              width,
              height,
              4,
              4,
            );
            resolve(hash);
          });
      });
    },
    catch: (cause) => new BlurhashGenerationFailedError({ cause }),
  });
}
