import { z } from "zod";
import {
  type MarketplaceMetadata,
  MarketplaceMetadataSchema,
} from "./marketplace.js";
import { type MediaImageMetadata, MediaImageMetadataSchema } from "./media.js";
import { evaluate } from "./utils.js";

export interface MetadataAttribute {
  value: string;
  key: string;
}

export interface PostMetadataDetails {
  /**
   * Random id also used in the url
   * Have to be unique on sigle
   */
  id: string;

  /**
   * Post title
   */
  title: string;

  /**
   * Markdown content
   */
  content: string;

  /**
   * List of attributes
   */
  attributes?: MetadataAttribute[];

  /**
   * The cover image
   */
  coverImage?: MediaImageMetadata;
}

export const PostMetadataDetailsSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  attributes: z
    .array(z.object({ value: z.string(), key: z.string() }))
    .min(1)
    .max(20)
    .optional(),
  coverImage: MediaImageMetadataSchema.optional(),
});

export type PostMetadata = MarketplaceMetadata & {
  content: PostMetadataDetails;
  // TODO add signature
  // signature: string;
};

export const PostMetadataSchema = MarketplaceMetadataSchema.extend({
  content: PostMetadataDetailsSchema,
  // TODO add signature
  // signature: z.string(),
});

export function createPostMetadata(data: PostMetadata): PostMetadata {
  return evaluate(PostMetadataSchema.safeParse(data));
}
