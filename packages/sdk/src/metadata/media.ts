import { z } from "zod";
import { POST_METADATA_LIMITS, urlWithSchemes } from "./limits.js";

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
  // The size of the image in pixels, so readers can lay it out before it loads
  width: number;
  height: number;
  // The alt tag of the image for accessibility
  alt?: string;
}

export const MediaImageMetadataSchema = z.object({
  // Readers resolve `ipfs://` and `ar://` URLs through a gateway.
  url: urlWithSchemes(
    ["http", "https", "ipfs", "ar"],
    POST_METADATA_LIMITS.coverImage,
  ).meta({
    description: "An http(s), ipfs:// or ar:// URL of the image.",
  }),
  type: z.enum(MediaImageMimeType).meta({
    description: "The MIME type of the image.",
  }),
  width: z.int().positive().meta({
    description: "The width of the image in pixels.",
  }),
  height: z.int().positive().meta({
    description: "The height of the image in pixels.",
  }),
  alt: z.string().max(POST_METADATA_LIMITS.alt).optional().meta({
    description: "The alt tag of the image for accessibility.",
  }),
});
