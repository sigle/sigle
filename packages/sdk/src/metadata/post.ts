import { z } from "zod";
import type { MediaImageMetadata } from "./media.js";
import type { MetadataAttribute } from "./metadata-attribute.js";
import { SignatureSchema, TagSchema } from "./common.js";
import { PostMetadataSchemaId } from "./config.js";
import { POST_METADATA_LIMITS, urlWithSchemes } from "./limits.js";
import { MediaImageMetadataSchema } from "./media.js";
import {
  MetadataAttributeSchema,
  MetadataAttributeType,
} from "./metadata-attribute.js";
import { evaluate } from "./utils.js";

export enum ContentWarning {
  NSFW = "NSFW",
  SENSITIVE = "SENSITIVE",
  SPOILER = "SPOILER",
}

export const ContentWarningSchema = z.enum(ContentWarning).meta({
  description:
    "Optional content warning label (uppercase in signed metadata: `NSFW`, `SENSITIVE`, or `SPOILER`).",
});

/**
 * The attribute keys Sigle reads from a post. Each one appears at most once,
 * as a `String` attribute.
 */
export enum PostAttributeKey {
  META_TITLE = "meta-title",
  META_DESCRIPTION = "meta-description",
  CANONICAL_URI = "canonical-uri",
}

const postAttributeValueSchemas = new Map<string, z.ZodType<string>>([
  [PostAttributeKey.META_TITLE, z.string().max(POST_METADATA_LIMITS.metaTitle)],
  [
    PostAttributeKey.META_DESCRIPTION,
    z.string().max(POST_METADATA_LIMITS.metaDescription),
  ],
  // The canonical URI points readers to the original web page of the post.
  [
    PostAttributeKey.CANONICAL_URI,
    urlWithSchemes(["http", "https"], POST_METADATA_LIMITS.canonicalUri),
  ],
]);

const PostAttributesSchema = MetadataAttributeSchema.array()
  .min(1)
  .max(POST_METADATA_LIMITS.attributes)
  // `z.toJSONSchema` can't emit a refinement, so the published JSON Schema
  // leaves these rules out: the description of the field states them.
  .superRefine((attributes, ctx) => {
    const seenKeys = new Set<string>();

    for (const [index, attribute] of attributes.entries()) {
      const valueSchema = postAttributeValueSchemas.get(attribute.key);

      if (!valueSchema) {
        continue;
      }

      if (seenKeys.has(attribute.key)) {
        ctx.addIssue({
          code: "custom",
          message: `Expected at most one "${attribute.key}" attribute`,
          path: [index, "key"],
        });
        continue;
      }

      seenKeys.add(attribute.key);

      if (attribute.type !== MetadataAttributeType.STRING) {
        ctx.addIssue({
          code: "custom",
          message: `Expected the "${attribute.key}" attribute to be a String`,
          path: [index, "type"],
        });
        continue;
      }

      for (const issue of valueSchema.safeParse(attribute.value).error
        ?.issues ?? []) {
        ctx.addIssue({
          code: "custom",
          message: issue.message,
          path: [index, "value"],
        });
      }
    }
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
   * A short plain text summary of the content, shown in post lists.
   */
  excerpt: string;
  /**
   * List of attributes that can be used to store any additional information that is not supported by the standard.
   */
  attributes?: Array<MetadataAttribute>;
  /**
   * The cover image
   */
  coverImage?: MediaImageMetadata;
  /**
   * An arbitrary list of tags.
   */
  tags?: Array<string>;
  /**
   * Specify a content warning
   */
  contentWarning?: ContentWarning;
}

export const PostMetadataDetailsSchema = z
  .object({
    id: z.string().min(1).meta({
      description:
        "Unique identifier of the post (matches the draft ID when publishing via the API).",
    }),
    title: z.string().min(1).max(POST_METADATA_LIMITS.title).meta({
      description: "Post title.",
    }),
    content: z.string().min(1).max(POST_METADATA_LIMITS.content).meta({
      description: "Markdown body of the post.",
    }),
    excerpt: z.string().max(POST_METADATA_LIMITS.excerpt).meta({
      description: "Short plain-text summary shown in post lists.",
    }),
    attributes: PostAttributesSchema.optional().meta({
      description: `Optional key-value metadata attributes. Recognized \`String\` attribute keys: \`${PostAttributeKey.META_TITLE}\` (up to ${POST_METADATA_LIMITS.metaTitle} characters), \`${PostAttributeKey.META_DESCRIPTION}\` (up to ${POST_METADATA_LIMITS.metaDescription} characters), and \`${PostAttributeKey.CANONICAL_URI}\` (HTTP(S) URL up to ${POST_METADATA_LIMITS.canonicalUri} characters), each at most once.`,
    }),
    coverImage: MediaImageMetadataSchema.optional().meta({
      description: "Cover image metadata.",
    }),
    tags: TagSchema.array()
      .min(1)
      .max(POST_METADATA_LIMITS.tags)
      .optional()
      .meta({
        description: "List of topic tags.",
      }),
    contentWarning: ContentWarningSchema.optional(),
  })
  .meta({
    description: "Post content and metadata signed by the author.",
  });

export type PostMetadata = {
  /**
   * The schema id.
   */
  $schema: PostMetadataSchemaId.LATEST;
  /**
   * The metadata details.
   */
  content: PostMetadataDetails;
  /**
   * The author's Stacks wallet signature of `JSON.stringify` of this metadata
   * without `signature`, as returned by `createPostMetadata` (keys in schema
   * order, unknown keys removed).
   */
  signature?: string;
};

export const PostMetadataSchema = z.object({
  $schema: z.literal(PostMetadataSchemaId.LATEST).meta({
    description: "JSON Schema URI identifying this post metadata version.",
  }),
  content: PostMetadataDetailsSchema,
  signature: SignatureSchema.optional(),
});

export function createPostMetadata(data: PostMetadata): PostMetadata {
  return evaluate(PostMetadataSchema.safeParse(data));
}
