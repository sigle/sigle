import { z } from "zod";
import { SignatureSchema } from "./common.js";
import { PostMetadataSchemaId } from "./config.js";
import {
  type MarketplaceMetadata,
  MarketplaceMetadataSchema,
} from "./marketplace.js";
import { type MediaImageMetadata, MediaImageMetadataSchema } from "./media.js";
import {
  type MetadataAttribute,
  MetadataAttributeSchema,
} from "./metadata-attribute.js";
import { evaluate } from "./utils.js";

export enum ContentWarning {
  NSFW = "NSFW",
  SENSITIVE = "SENSITIVE",
  SPOILER = "SPOILER",
}

export const ContentWarningSchema = z.enum(ContentWarning).meta({
  description: "Specify a content warning.",
});

export interface PostMetadataDetails {
  /**
   * Random id also used in the url
   * Have to be unique on sigle. Use a UUID if unsure.
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
   * List of attributes that can be used to store any additional information that is not supported by the standard.
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
  /**
   * Specify a content warning
   */
  contentWarning?: ContentWarning;
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
  attributes: MetadataAttributeSchema.array().min(1).max(20).optional().meta({
    description:
      "List of attributes that can be used to store any additional information that is not supported by the standard",
  }),
  coverImage: MediaImageMetadataSchema.optional().meta({
    description: "The cover image.",
  }),
  tags: z.array(z.string()).min(1).max(5).optional().meta({
    description: "List of tags.",
  }),
  contentWarning: ContentWarningSchema.optional(),
});

export type PostMetadata = MarketplaceMetadata & {
  /**
   * The schema id.
   */
  $schema: PostMetadataSchemaId.LATEST;
  /**
   * The metadata details.
   */
  content: PostMetadataDetails;
  /**
   * A cryptographic signature of the `content` data.
   */
  signature?: string;
};

export const PostMetadataSchema = MarketplaceMetadataSchema.extend({
  $schema: z.literal(PostMetadataSchemaId.LATEST),
  content: PostMetadataDetailsSchema,
  signature: SignatureSchema.optional(),
});

export function createPostMetadata(data: PostMetadata): PostMetadata {
  return evaluate(PostMetadataSchema.safeParse(data));
}
