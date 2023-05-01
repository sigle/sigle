import sharp from 'sharp';

const WEBP = 'image/webp';
const PNG = 'image/png';
const JPEG = 'image/jpeg';

const allowedFormats = [WEBP, PNG, JPEG];

/**
 * Inspired by next.js image optimization
 * https://github.com/vercel/next.js/blob/canary/packages/next/src/server/image-optimizer.ts
 */
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
  const transformer = sharp(buffer);

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
    transformer.jpeg({ quality });
  }

  const optimizedBuffer = await transformer.toBuffer();
  return optimizedBuffer;
}
