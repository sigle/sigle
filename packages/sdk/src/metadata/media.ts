import { z } from "zod";

export enum MediaImageMimeType {
  GIF = "image/gif",
  JPEG = "image/jpeg",
  PNG = "image/png",
  WEBP = "image/webp",
}

export interface MediaImageMetadata {
  url: string;
  type: MediaImageMimeType;
  width?: number;
  height?: number;
  alt?: string;
}

export const MediaImageMetadataSchema = z.object({
  url: z.url(),
  type: z.enum(MediaImageMimeType),
  alt: z.string().optional(),
});
