import { describe, expect, it } from "vite-plus/test";
import type { MetadataAttribute } from "./metadata-attribute.js";
import type { PostMetadata } from "./post.js";
import { PostMetadataSchemaId } from "./config.js";
import { MediaImageMimeType } from "./media.js";
import { MetadataAttributeType } from "./metadata-attribute.js";
import { PostAttributeKey, PostMetadataSchema } from "./post.js";

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
    ...contentOverrides,
  },
});

const stringAttribute = (key: string, value: string): MetadataAttribute => ({
  type: MetadataAttributeType.STRING,
  key,
  value,
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
            attributes: [
              stringAttribute(PostAttributeKey.META_TITLE, "a".repeat(100)),
              stringAttribute(
                PostAttributeKey.META_DESCRIPTION,
                "a".repeat(250),
              ),
              stringAttribute(
                PostAttributeKey.CANONICAL_URI,
                `https://example.com/${"a".repeat(180)}`,
              ),
              stringAttribute("a".repeat(100), "a".repeat(1000)),
            ],
            coverImage: {
              url: "ar://cover-transaction-id",
              type: MediaImageMimeType.PNG,
              alt: "a".repeat(1000),
            },
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
            attributes: [
              stringAttribute(
                PostAttributeKey.CANONICAL_URI,
                "HTTPS://example.com/original",
              ),
            ],
            coverImage: { url: "Ar://cover", type: MediaImageMimeType.PNG },
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
      name: "an attribute value over 1000 characters",
      metadata: createMetadata(
        {},
        { attributes: [stringAttribute("other", "a".repeat(1001))] },
      ),
      path: "content.attributes.0.value",
    },
    {
      name: "a meta title over 100 characters",
      metadata: createMetadata(
        {},
        {
          attributes: [
            stringAttribute(PostAttributeKey.META_TITLE, "a".repeat(101)),
          ],
        },
      ),
      path: "content.attributes.0.value",
    },
    {
      name: "a meta description over 250 characters",
      metadata: createMetadata(
        {},
        {
          attributes: [
            stringAttribute(PostAttributeKey.META_DESCRIPTION, "a".repeat(251)),
          ],
        },
      ),
      path: "content.attributes.0.value",
    },
    {
      name: "a canonical URI that is not http(s)",
      metadata: createMetadata(
        {},
        {
          attributes: [
            stringAttribute(
              PostAttributeKey.CANONICAL_URI,
              "javascript:alert(1)",
            ),
          ],
        },
      ),
      path: "content.attributes.0.value",
    },
    {
      name: "a canonical URI that is not a String attribute",
      metadata: createMetadata(
        {},
        {
          attributes: [
            {
              type: MetadataAttributeType.JSON,
              key: PostAttributeKey.CANONICAL_URI,
              value: '"https://example.com"',
            },
          ],
        },
      ),
      path: "content.attributes.0.type",
    },
    {
      name: "a second meta title",
      metadata: createMetadata(
        {},
        {
          attributes: [
            stringAttribute(PostAttributeKey.META_TITLE, "First"),
            stringAttribute(PostAttributeKey.META_TITLE, "Second"),
          ],
        },
      ),
      path: "content.attributes.1.key",
    },
    {
      name: "a cover image alt over 1000 characters",
      metadata: createMetadata(
        {},
        {
          coverImage: {
            url: "ar://cover",
            type: MediaImageMimeType.PNG,
            alt: "a".repeat(1001),
          },
        },
      ),
      path: "content.coverImage.alt",
    },
    {
      name: "an attribute key over 100 characters",
      metadata: createMetadata(
        {},
        { attributes: [stringAttribute("a".repeat(101), "value")] },
      ),
      path: "content.attributes.0.key",
    },
    {
      name: "a cover image URL with another scheme",
      metadata: createMetadata(
        {},
        {
          coverImage: {
            url: "data:image/png;base64,AAAA",
            type: MediaImageMimeType.PNG,
          },
        },
      ),
      path: "content.coverImage.url",
    },
    {
      name: "a Date attribute value over 1000 characters",
      metadata: createMetadata(
        {},
        {
          attributes: [
            {
              type: MetadataAttributeType.DATE,
              key: "date",
              value: `2026-01-01T00:00:00.${"1".repeat(1000)}Z`,
            },
          ],
        },
      ),
      path: "content.attributes.0.value",
    },
  ])("rejects $name", ({ metadata, path }) => {
    expect(new Set(issuePaths(metadata))).toStrictEqual(new Set([path]));
  });
});
