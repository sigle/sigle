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
          { name: "a".repeat(300), description: "a".repeat(1000) },
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
              stringAttribute("other", "a".repeat(1000)),
            ],
            coverImage: {
              url: "ar://cover-transaction-id",
              type: MediaImageMimeType.PNG,
            },
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
      name: "a name over 300 characters",
      metadata: createMetadata({ name: "a".repeat(301) }),
      path: "name",
    },
    {
      name: "a description over 1000 characters",
      metadata: createMetadata({ description: "a".repeat(1001) }),
      path: "description",
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
  ])("rejects $name", ({ metadata, path }) => {
    expect(new Set(issuePaths(metadata))).toStrictEqual(new Set([path]));
  });
});
