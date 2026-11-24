import { z } from "zod";
import { SignatureSchema, Tagchema } from "./common.js";
import { PostMetadataSchemaId } from "./config.js";
import { type MediaImageMetadata, MediaImageMetadataSchema } from "./media.js";
import { evaluate } from "./utils.js";

export interface PostMetadataAttribute {
  /**
   * The attribute's unique identifier.
   */
  key: string;
  /**
   * The attribute's value.
   */
  value: string;
}

export const PostMetadataAttributeSchema = z.object({
  key: z.string().min(1).meta({
    description: "The attribute's unique identifier.",
  }),
  value: z.string().meta({ description: "The attribute's value." }),
});

export interface PostMetadataDetails {
  /**
   * The post id, the same for every revision of the post. Sigle uses it in
   * the post URL.
   */
  id: string;
  /**
   * Post title.
   */
  title: string;
  /**
   * Markdown content.
   */
  content: string;
  /**
   * A short plain text summary of the content, shown in post lists.
   */
  excerpt: string;
  /**
   * When the author published this revision, as an ISO 8601 date.
   */
  publishedAt: string;
  /**
   * The Arweave transaction id of the revision this one replaces.
   */
  previousVersion?: string;
  /**
   * The cover image.
   */
  coverImage?: MediaImageMetadata;
  /**
   * An arbitrary list of tags.
   */
  tags?: string[];
  /**
   * The language of the content, as a BCP 47 tag such as `en`.
   */
  language?: string;
  /**
   * The title for search engines and link previews, the title when omitted.
   */
  metaTitle?: string;
  /**
   * The description for search engines and link previews, the excerpt when
   * omitted.
   */
  metaDescription?: string;
  /**
   * The URL of the original version of the post when it was first published
   * elsewhere.
   */
  canonicalUri?: string;
  /**
   * Additional information that is not part of the standard.
   */
  attributes?: PostMetadataAttribute[];
}

export const PostMetadataDetailsSchema = z.object({
  id: z.string().min(1).meta({
    description:
      "The post id, the same for every revision of the post. Sigle uses it in the post URL.",
  }),
  title: z.string().min(1).meta({ description: "Post title." }),
  content: z.string().min(1).meta({ description: "Markdown content." }),
  excerpt: z.string().meta({
    description:
      "A short plain text summary of the content, shown in post lists.",
  }),
  publishedAt: z.iso.datetime().meta({
    description:
      "When the author published this revision, as an ISO 8601 date.",
  }),
  previousVersion: z.string().min(1).optional().meta({
    description:
      "The Arweave transaction id of the revision this one replaces.",
  }),
  coverImage: MediaImageMetadataSchema.optional().meta({
    description: "The cover image.",
  }),
  tags: Tagchema.array().min(1).max(5).optional().meta({
    description: "An arbitrary list of tags.",
  }),
  language: z.string().min(2).max(35).optional().meta({
    description: "The language of the content, as a BCP 47 tag such as `en`.",
  }),
  metaTitle: z.string().min(1).optional().meta({
    description:
      "The title for search engines and link previews, the title when omitted.",
  }),
  metaDescription: z.string().min(1).optional().meta({
    description:
      "The description for search engines and link previews, the excerpt when omitted.",
  }),
  canonicalUri: z.url().optional().meta({
    description:
      "The URL of the original version of the post when it was first published elsewhere.",
  }),
  attributes: PostMetadataAttributeSchema.array()
    .min(1)
    .max(20)
    .optional()
    .meta({
      description: "Additional information that is not part of the standard.",
    }),
});

export interface PostMetadata {
  /**
   * The schema id.
   */
  $schema: PostMetadataSchemaId.LATEST;
  /**
   * The metadata details.
   */
  content: PostMetadataDetails;
  /**
   * The author's SIP-018 signature of the metadata, see
   * `postSignatureMessage`.
   */
  signature?: string;
}

export const PostMetadataSchema = z.object({
  $schema: z.literal(PostMetadataSchemaId.LATEST),
  content: PostMetadataDetailsSchema,
  signature: SignatureSchema.optional(),
});

export function createPostMetadata(data: PostMetadata): PostMetadata {
  return evaluate(PostMetadataSchema.safeParse(data));
}
