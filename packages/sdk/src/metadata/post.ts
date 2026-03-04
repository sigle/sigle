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

  /**
   * List of tags
   */
  tags?: string[];
}

export const PostMetadataDetailsSchema = z.object({
  id: z.string().min(1).meta({
    description: "Random id also used in the url. Have to be unique on sigle.",
  }),
  title: z.string().min(1).meta({
    description: "Post title.",
  }),
  content: z.string().min(1).meta({
    description: "Markdown content.",
  }),
  attributes: z
    .array(z.object({ value: z.string(), key: z.string() }))
    .min(1)
    .max(20)
    .optional()
    .meta({
      description: "List of attributes.",
    }),
  coverImage: MediaImageMetadataSchema.optional().meta({
    description: "The cover image.",
  }),
  tags: z.array(z.string()).min(1).max(5).optional().meta({
    description: "List of tags.",
  }),
});

export type PostMetadata = MarketplaceMetadata & {
  content: PostMetadataDetails;
  // TODO add signature
  // signature: string;
  // TODO add version for the content
};

export const PostMetadataSchema = MarketplaceMetadataSchema.extend({
  content: PostMetadataDetailsSchema,
  // TODO add signature
  // signature: z.string(),
});

export function createPostMetadata(data: PostMetadata): PostMetadata {
  return evaluate(PostMetadataSchema.safeParse(data));
}
