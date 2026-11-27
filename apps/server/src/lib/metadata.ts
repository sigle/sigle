import { PostAttributeKey, PostMetadataSchema } from "@sigle/sdk";
import { fromZod } from "@/lib/zod-schema";

/**
 * Signed metadata formats are defined in `@sigle/sdk` (and published as JSON
 * schemas), so the zod schemas are reused instead of being mirrored in Effect.
 *
 * The SDK schema leaves `signature` optional, as the metadata is built before
 * the wallet signs it. The API only accepts signed metadata, so it is required
 * here, and the OpenAPI specification and generated SDK say so.
 */
export const PostMetadata = fromZod(
  PostMetadataSchema.required({ signature: true }),
  {
    identifier: "PostMetadata",
    description: "The signed post metadata to upload to Arweave.",
  },
);

/** The post columns a signed metadata fills in. */
export const postFieldsFromMetadata = (metadata: typeof PostMetadata.Type) => {
  const attributes = metadata.content.attributes ?? [];

  const findAttribute = (key: PostAttributeKey): string | null =>
    attributes.find((attribute) => attribute.key === key)?.value ?? null;

  const version = (metadata.$schema.split("/").at(-1) ?? "1.0.0").replace(
    ".json",
    "",
  );

  return {
    title: metadata.content.title,
    content: metadata.content.content,
    excerpt: metadata.content.excerpt,
    metaTitle: findAttribute(PostAttributeKey.META_TITLE),
    metaDescription: findAttribute(PostAttributeKey.META_DESCRIPTION),
    canonicalUri: findAttribute(PostAttributeKey.CANONICAL_URI),
    coverImage: metadata.content.coverImage?.url ?? null,
    tags: metadata.content.tags ?? [],
    version,
  };
};
