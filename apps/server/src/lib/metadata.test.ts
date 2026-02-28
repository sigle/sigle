import { Result } from "better-result";
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getMetadataFromUri,
  MetadataFetchFailedError,
  InvalidMetadataError,
} from "./metadata";

const mockFetch = vi.fn();

vi.stubGlobal("fetch", mockFetch);

const validMetadata = {
  content: {
    id: "post-123",
    title: "Test Post",
    content: "# Hello World",
    attributes: [
      { key: "meta-title", value: "SEO Title" },
      { key: "meta-description", value: "SEO Description" },
      { key: "excerpt", value: "Post excerpt" },
      { key: "canonical-uri", value: "https://example.com/post" },
    ],
    coverImage: {
      url: "https://example.com/image.jpg",
      type: "image/jpeg",
    },
    tags: ["tag1", "tag2"],
  },
};

describe("metadata", () => {
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

      expect(result.isOk()).toBeTruthy();
      expect(result).toStrictEqual(
        Result.ok({
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
        }),
      );
    });

    it("should return ok result with minimal metadata when no attributes", async () => {
      const minimalMetadata = {
        content: {
          id: "post-456",
          title: "Minimal Post",
          content: "Content",
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => minimalMetadata,
      });

      const result = await getMetadataFromUri(
        "https://example.com/minimal.json",
      );

      expect(result.isOk()).toBeTruthy();
      expect(result).toStrictEqual(
        Result.ok({
          id: "post-456",
          title: "Minimal Post",
          content: "Content",
          metaTitle: undefined,
          metaDescription: undefined,
          excerpt: "",
          coverImage: undefined,
          tags: undefined,
          canonicalUri: undefined,
        }),
      );
    });

    it("should return err with MetadataFetchFailedError on fetch failure", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const result = await getMetadataFromUri("https://example.com/fail.json");

      expect(result.isOk()).toBeFalsy();
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

      expect(result.isOk()).toBeFalsy();
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

      expect(result.isOk()).toBeFalsy();
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

      expect(result.isOk()).toBeFalsy();
      const error = (result as unknown as { error: MetadataFetchFailedError })
        .error;
      expect(error).toBeInstanceOf(MetadataFetchFailedError);
    });
  });
});
