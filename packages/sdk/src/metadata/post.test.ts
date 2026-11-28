import { describe, expect, it } from "vite-plus/test";
import type { PostMetadata } from "./post.js";
import { PostMetadataSchemaId } from "./config.js";
import { MediaImageMimeType } from "./media.js";
import { PostMetadataSchema } from "./post.js";

const createMetadata = (
  overrides: Partial<PostMetadata> = {},
  contentOverrides: Partial<PostMetadata["content"]> = {},
): PostMetadata => ({
  $schema: PostMetadataSchemaId.LATEST,
  ...overrides,
  content: {
    id: "post-id",
    title: "A title",
    content: "Some **Markdown**.",
    excerpt: "Some Markdown.",
    publishedAt: "2026-11-24T10:00:00.000Z",
    ...contentOverrides,
  },
});

const coverImage = (
  overrides: Partial<NonNullable<PostMetadata["content"]["coverImage"]>> = {},
): NonNullable<PostMetadata["content"]["coverImage"]> => ({
  url: "ar://cover-transaction-id",
  type: MediaImageMimeType.PNG,
  width: 1200,
  height: 630,
  ...overrides,
});

/** The paths of the issues the schema reports, empty when it accepts. */
const issuePaths = (metadata: unknown): Array<string> =>
  PostMetadataSchema.safeParse(metadata).error?.issues.map((issue) =>
    issue.path.join("."),
  ) ?? [];

describe("PostMetadataSchema limits", () => {
  it("accepts metadata at the limits", () => {
    expect(
      issuePaths(
        createMetadata(
          {},
          {
            title: "a".repeat(300),
            excerpt: "a".repeat(1000),
            previousVersion: "a".repeat(100),
            metaTitle: "a".repeat(100),
            metaDescription: "a".repeat(250),
            canonicalUri: `https://example.com/${"a".repeat(180)}`,
            attributes: [{ key: "a".repeat(100), value: "a".repeat(1000) }],
            coverImage: coverImage({ alt: "a".repeat(1000) }),
          },
        ),
      ),
    ).toStrictEqual([]);
  });

  // Drafts accept them: their URL check reads the parsed, lowercase protocol.
  it("accepts URL schemes in any case", () => {
    expect(
      issuePaths(
        createMetadata(
          {},
          {
            canonicalUri: "HTTPS://example.com/original",
            coverImage: coverImage({ url: "Ar://cover" }),
          },
        ),
      ),
    ).toStrictEqual([]);
  });

  it.each([
    {
      name: "a title over 300 characters",
      metadata: createMetadata({}, { title: "a".repeat(301) }),
      path: "content.title",
    },
    {
      name: "an excerpt over 1000 characters",
      metadata: createMetadata({}, { excerpt: "a".repeat(1001) }),
      path: "content.excerpt",
    },
    {
      name: "a previous version over 100 characters",
      metadata: createMetadata({}, { previousVersion: "a".repeat(101) }),
      path: "content.previousVersion",
    },
    {
      name: "an attribute value over 1000 characters",
      metadata: createMetadata(
        {},
        { attributes: [{ key: "other", value: "a".repeat(1001) }] },
      ),
      path: "content.attributes.0.value",
    },
    {
      name: "a meta title over 100 characters",
      metadata: createMetadata({}, { metaTitle: "a".repeat(101) }),
      path: "content.metaTitle",
    },
    {
      name: "a meta description over 250 characters",
      metadata: createMetadata({}, { metaDescription: "a".repeat(251) }),
      path: "content.metaDescription",
    },
    {
      name: "a canonical URI that is not http(s)",
      metadata: createMetadata({}, { canonicalUri: "javascript:alert(1)" }),
      path: "content.canonicalUri",
    },
    {
      name: "a canonical URI over 200 characters",
      metadata: createMetadata(
        {},
        { canonicalUri: `https://example.com/${"a".repeat(181)}` },
      ),
      path: "content.canonicalUri",
    },
    {
      name: "a cover image alt over 1000 characters",
      metadata: createMetadata(
        {},
        { coverImage: coverImage({ alt: "a".repeat(1001) }) },
      ),
      path: "content.coverImage.alt",
    },
    {
      name: "an attribute key over 100 characters",
      metadata: createMetadata(
        {},
        { attributes: [{ key: "a".repeat(101), value: "value" }] },
      ),
      path: "content.attributes.0.key",
    },
    {
      name: "a cover image URL with another scheme",
      metadata: createMetadata(
        {},
        { coverImage: coverImage({ url: "data:image/png;base64,AAAA" }) },
      ),
      path: "content.coverImage.url",
    },
  ])("rejects $name", ({ metadata, path }) => {
    expect(new Set(issuePaths(metadata))).toStrictEqual(new Set([path]));
  });
});
