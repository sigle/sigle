import { z } from "zod";
import { POST_METADATA_LIMITS } from "./limits.js";

export interface MarketplaceMetadata {
  name?: string;
  description?: string;
  external_url?: string;
  image?: string;
}

export const MarketplaceMetadataSchema = z.object({
  name: z.string().max(POST_METADATA_LIMITS.name).optional(),
  description: z.string().max(POST_METADATA_LIMITS.description).optional(),
  external_url: z.url().optional(),
  image: z.url().optional(),
});
