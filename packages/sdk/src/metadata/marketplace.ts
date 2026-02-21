import { z } from "zod";

export interface MarketplaceMetadata {
  name?: string;
  description?: string;
  external_url?: string;
  image?: string;
}

export const MarketplaceMetadataSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  external_url: z.url().optional(),
  image: z.url().optional(),
});
