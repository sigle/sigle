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
 * A URL with one of the given schemes, such as `["http", "https"]`, in any
 * case, as URL parsers accept `HTTPS://`. The scheme check is also written as
 * a `pattern`, without flags as JSON Schema has none, and the `uri` format is
 * kept, so the JSON Schema checks both.
 */
export const urlWithSchemes = (schemes: Array<string>, maxLength: number) => {
  const anyCaseSchemes = schemes.map((scheme) =>
    scheme.replaceAll(
      /[a-z]/g,
      (letter) => `[${letter}${letter.toUpperCase()}]`,
    ),
  );

  return (
    z
      // The parsed protocol is lowercase.
      .url({ protocol: new RegExp(`^(${schemes.join("|")})$`) })
      .regex(new RegExp(`^(${anyCaseSchemes.join("|")}):`), {
        message: `Expected a ${schemes.map((scheme) => `${scheme}:`).join(", ")} URL`,
      })
      .max(maxLength)
      .meta({ format: "uri" })
  );
};
