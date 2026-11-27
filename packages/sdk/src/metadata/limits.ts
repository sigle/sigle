import { z } from "zod";

/**
 * Size limits of the post metadata format, in characters for strings. Sigle
 * holds its drafts to the same limits, so a draft that saves can be published.
 */
export const POST_METADATA_LIMITS = {
  title: 300,
  // Markdown, with images embedded by URL, not inline.
  content: 1_000_000,
  // Sigle's editor sends the first 350 characters of the text.
  excerpt: 1000,
  metaTitle: 100,
  metaDescription: 250,
  canonicalUri: 200,
  coverImage: 2048,
  tags: 5,
  tag: 50,
  attributes: 20,
  attributeValue: 1000,
  name: 300,
  description: 1000,
} as const;

/**
 * A URL with one of the given schemes, such as `["http", "https"]`. The
 * scheme check is also written as a `pattern`, so the JSON Schema has it.
 */
export const urlWithSchemes = (schemes: Array<string>, maxLength: number) => {
  const alternatives = schemes.join("|");

  return z
    .url({ protocol: new RegExp(`^(${alternatives})$`) })
    .regex(new RegExp(`^(${alternatives}):`), {
      message: `Expected a ${schemes.map((scheme) => `${scheme}:`).join(", ")} URL`,
    })
    .max(maxLength);
};
