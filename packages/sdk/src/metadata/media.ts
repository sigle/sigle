import { z } from "zod";

export enum MediaImageMimeType {
  GIF = "image/gif",
  JPEG = "image/jpeg",
  PNG = "image/png",
  WEBP = "image/webp",
}

export interface MediaImageMetadata {
  url: string;
  // The MIME type of the image
  type: MediaImageMimeType;
  // The alt tag of the image for accessibility
  alt?: string;
}

export const MediaImageMetadataSchema = z.object({
  url: z.url(),
  type: z.enum(MediaImageMimeType).meta({
    description: "The MIME type of the image.",
  }),
  alt: z.string().optional().meta({
    description: "The alt tag of the image for accessibility.",
  }),
});
