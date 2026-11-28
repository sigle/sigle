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
  // The alt tag of the image for accessibility
  alt?: string;
}

export const MediaImageMetadataSchema = z.object({
  // Readers resolve `ipfs://` and `ar://` URLs through a gateway.
  url: urlWithSchemes(
    ["http", "https", "ipfs", "ar"],
    POST_METADATA_LIMITS.coverImage,
  ).meta({
    description: "Image URL (`http(s)://`, `ipfs://`, or `ar://`).",
  }),
  type: z.enum(MediaImageMimeType).meta({
    description: "MIME type of the image.",
  }),
  alt: z.string().max(POST_METADATA_LIMITS.alt).optional().meta({
    description: "Alternative text for accessibility.",
  }),
});
