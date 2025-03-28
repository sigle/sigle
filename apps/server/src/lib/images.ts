import { encode } from "blurhash";
import sharp from "sharp";
import { blurHashToDataURL } from "./blurhash";
import { convertCIDv0toCIDv1 } from "./ipfs";

export const resolveImageUrl = (image: string) => {
  if (image?.startsWith("ipfs://")) {
    let cid = image.slice(7);
    // We convert the CID to a v1 CID if it's a v0 CID so that images can be served by subdomain gateways
    if (cid.startsWith("Qm")) {
      cid = convertCIDv0toCIDv1(cid);
    }
    image = `https://${cid}.ipfs.w3s.link/`;
  }
  if (image?.startsWith("ar://")) {
    image = `https://arweave.net/${image.slice(5)}`;
  }
  return image;
};

const WEBP = "image/webp";
const PNG = "image/png";
const JPEG = "image/jpeg";
export const allowedFormats = [WEBP, PNG, JPEG] as const;

export async function optimizeImage({
  buffer,
  contentType,
  quality,
  width,
  height,
}: {
  buffer: Buffer | ArrayBuffer;
  contentType: string;
  quality: number;
  width: number;
  height?: number;
}): Promise<Buffer> {
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

  if (contentType === WEBP) {
    transformer.webp({ quality });
  } else if (contentType === PNG) {
    transformer.png({ quality });
  } else if (contentType === JPEG) {
    transformer.jpeg({ quality, progressive: true });
  }

  const optimizedBuffer = await transformer.toBuffer();
  return optimizedBuffer;
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

export async function generateBlurhashURI({
  buffer,
  size = 40,
}: {
  buffer: Buffer | ArrayBuffer;
  size?: number;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    sharp(buffer)
      .raw()
      .ensureAlpha()
      .resize(size, size, { fit: "inside" })
      .toBuffer((err, buffer, { width, height }) => {
        if (err) return reject(err);
        const encoded = encode(
          new Uint8ClampedArray(buffer),
          width,
          height,
          4,
          4,
        );
        resolve(blurHashToDataURL(encoded));
      });
  });
}
