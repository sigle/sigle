import { hashPostMetadata, PostMetadataSchema } from "@sigle/sdk";
import { describe, expect, it } from "vite-plus/test";
import { generateSigleMetadataFromForm } from "./utils";

// SAFETY: only getText is read
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const editor = { getText: () => "words".repeat(200) } as never;

const post = {
  type: "draft" as const,
  title: "My title",
  content: "Hello **world**",
  metaTitle: "Meta title",
  metaDescription: "Meta description",
  canonicalUri: "https://example.com/original",
  tags: ["web3"],
  contentWarning: "nsfw" as const,
};

const build = (overrides: Partial<typeof post> = {}) =>
  generateSigleMetadataFromForm({
    editor,
    postId: "draft-1",
    post: { ...post, ...overrides },
  });

describe(generateSigleMetadataFromForm, () => {
  it("builds metadata the SDK schema accepts", async () => {
    const result = await build();

    expect(() => PostMetadataSchema.parse(result)).not.toThrow();
    expect(result.content.id).toBe("draft-1");
  });

  it("writes the SEO fields the server reads", async () => {
    const result = await build();

    expect({
      metaTitle: result.content.metaTitle,
      metaDescription: result.content.metaDescription,
      canonicalUri: result.content.canonicalUri,
    }).toStrictEqual({
      metaTitle: "Meta title",
      metaDescription: "Meta description",
      canonicalUri: "https://example.com/original",
    });
  });

  it("limits the excerpt to 350 characters", async () => {
    const result = await build();

    expect(result.content.excerpt).toHaveLength(350);
  });

  it("hashes the same once parsed by the server", async () => {
    const result = await build();

    // The server parses the metadata it receives and checks the signature
    // over its hash, so a re-parse must not change the signed hash.
    expect(
      hashPostMetadata(
        // oxlint-disable-next-line unicorn/prefer-structured-clone -- tests the JSON round trip
        PostMetadataSchema.parse(JSON.parse(JSON.stringify(result))),
      ),
    ).toBe(hashPostMetadata(result));
  });

  it("leaves the SEO fields and tags out when empty", async () => {
    const result = await build({
      metaTitle: "",
      metaDescription: "",
      canonicalUri: "",
      tags: [],
    });

    // zod keeps the keys with `undefined` values; the signed JSON drops them.
    // oxlint-disable-next-line unicorn/prefer-structured-clone -- tests the JSON round trip
    const signedContent = JSON.parse(JSON.stringify(result.content));

    expect(
      ["metaTitle", "metaDescription", "canonicalUri", "tags"].filter(
        (key) => key in signedContent,
      ),
    ).toStrictEqual([]);
  });
});
