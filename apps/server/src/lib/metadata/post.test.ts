import { PostMetadataSchemaId } from "@sigle/sdk";
import { Result } from "better-result";
import { describe, expect, it, vi, beforeEach } from "vite-plus/test";
import { InvalidMetadataError, MetadataFetchFailedError } from "./errors";

vi.mock(import("@stacks/encryption"), () => ({
  hashMessage: vi.fn().mockReturnValue(new Uint8Array(32)),
  verifyMessageSignatureRsv: vi.fn().mockReturnValue(true),
}));

vi.mock(import("@stacks/transactions"), () => ({
  createMessageSignature: vi.fn().mockReturnValue({ data: "sig-data" }),
  publicKeyFromSignatureRsv: vi.fn().mockReturnValue("pub-key"),
  publicKeyToAddress: vi
    .fn()
    .mockReturnValue("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"),
}));

const mockFetch = vi.fn();

vi.stubGlobal("fetch", mockFetch);

const { getMetadataFromUri } = await import("./post");

const validMetadata = {
  $schema: PostMetadataSchemaId.LATEST,
  signature: "mock-signature",
  content: {
    id: "post-123",
    title: "Test Post",
    content: "# Hello World",
    attributes: [
      { type: "String", key: "meta-title", value: "SEO Title" },
      { type: "String", key: "meta-description", value: "SEO Description" },
      { type: "String", key: "excerpt", value: "Post excerpt" },
      {
        type: "String",
        key: "canonical-uri",
        value: "https://example.com/post",
      },
    ],
    coverImage: {
      url: "https://example.com/image.jpg",
      type: "image/jpeg",
    },
    tags: ["tag1", "tag2"],
  },
};

describe("post metadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe(getMetadataFromUri, () => {
    it("should return ok result with parsed metadata on successful fetch", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => validMetadata,
      });

      const result = await getMetadataFromUri(
        "https://example.com/metadata.json",
      );

      expect(result.isOk()).toBe(true);
      expect(result).toStrictEqual(
        Result.ok({
          version: "1.0.0",
          id: "post-123",
          title: "Test Post",
          content: "# Hello World",
          metaTitle: "SEO Title",
          metaDescription: "SEO Description",
          excerpt: "Post excerpt",
          coverImage: {
            url: "https://example.com/image.jpg",
            type: "image/jpeg",
          },
          tags: ["tag1", "tag2"],
          canonicalUri: "https://example.com/post",
          signature: "mock-signature",
          recoveredAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        }),
      );
    });

    it("should return err with MetadataFetchFailedError on fetch failure", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const result = await getMetadataFromUri("https://example.com/fail.json");

      expect(result.isOk()).toBe(false);
      const error = (result as unknown as { error: MetadataFetchFailedError })
        .error;
      expect(error).toBeInstanceOf(MetadataFetchFailedError);
      expect(error._tag).toBe("MetadataFetchFailedError");
      expect(error.error).toContain("Network error");
    });

    it("should return err with MetadataFetchFailedError on non-ok response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await getMetadataFromUri(
        "https://example.com/notfound.json",
      );

      expect(result.isOk()).toBe(false);
      const error = (result as unknown as { error: MetadataFetchFailedError })
        .error;
      expect(error).toBeInstanceOf(MetadataFetchFailedError);
    });

    it("should return err with InvalidMetadataError on invalid metadata", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ content: { id: "invalid" } }),
      });

      const result = await getMetadataFromUri(
        "https://example.com/invalid.json",
      );

      expect(result.isOk()).toBe(false);
      const error = (result as unknown as { error: InvalidMetadataError })
        .error;
      expect(error).toBeInstanceOf(InvalidMetadataError);
      expect(error._tag).toBe("InvalidMetadataError");
      expect(error.error).toBeDefined();
    });

    it("should return err with MetadataFetchFailedError when fetch returns non-JSON", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError("Unexpected token");
        },
      });

      const result = await getMetadataFromUri("https://example.com/bad.json");

      expect(result.isOk()).toBe(false);
      const error = (result as unknown as { error: MetadataFetchFailedError })
        .error;
      expect(error).toBeInstanceOf(MetadataFetchFailedError);
    });
  });
});
