import { ProfileMetadataSchemaId } from "@sigle/sdk";
import { Result } from "better-result";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { InvalidMetadataError, MetadataFetchFailedError } from "./errors";
import { getProfileMetadataFromUri } from "./profile";

const mockFetch = vi.fn();

vi.stubGlobal("fetch", mockFetch);

const validMetadata = {
  $schema: ProfileMetadataSchemaId.LATEST,
  content: {
    id: "profile-123",
    displayName: "Test User",
    description: "This is my bio",
    website: "https://example.com",
    twitter: "testuser",
    picture: "https://example.com/avatar.jpg",
    coverPicture: "https://example.com/cover.jpg",
  },
};

describe("profile metadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe(getProfileMetadataFromUri, () => {
    it("should return ok result with parsed metadata on successful fetch", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => validMetadata,
      });

      const result = await getProfileMetadataFromUri(
        "https://example.com/metadata.json",
      );

      expect(result.isOk()).toBeTruthy();
      expect(result).toStrictEqual(Result.ok(validMetadata));
    });

    it("should return err with MetadataFetchFailedError on fetch failure", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const result = await getProfileMetadataFromUri(
        "https://example.com/fail.json",
      );

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

      const result = await getProfileMetadataFromUri(
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

      const result = await getProfileMetadataFromUri(
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

      const result = await getProfileMetadataFromUri(
        "https://example.com/bad.json",
      );

      expect(result.isOk()).toBeFalsy();
      const error = (result as unknown as { error: MetadataFetchFailedError })
        .error;
      expect(error).toBeInstanceOf(MetadataFetchFailedError);
    });

    it("should return err with InvalidMetadataError when missing required fields", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          $schema: ProfileMetadataSchemaId.LATEST,
          content: {},
        }),
      });

      const result = await getProfileMetadataFromUri(
        "https://example.com/missing-fields.json",
      );

      expect(result.isOk()).toBeFalsy();
      const error = (result as unknown as { error: InvalidMetadataError })
        .error;
      expect(error).toBeInstanceOf(InvalidMetadataError);
      expect(error._tag).toBe("InvalidMetadataError");
    });

    it("should return ok result with minimal valid metadata", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          $schema: ProfileMetadataSchemaId.LATEST,
          content: {
            id: "profile-minimal",
          },
        }),
      });

      const result = await getProfileMetadataFromUri(
        "https://example.com/minimal.json",
      );

      expect(result.isOk()).toBeTruthy();
      expect(result).toStrictEqual(
        Result.ok({
          $schema: ProfileMetadataSchemaId.LATEST,
          content: {
            id: "profile-minimal",
          },
        }),
      );
    });

    it("should return err with InvalidMetadataError when twitter handle has invalid format", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          $schema: ProfileMetadataSchemaId.LATEST,
          content: {
            id: "profile-123",
            twitter: "invalid@handle",
          },
        }),
      });

      const result = await getProfileMetadataFromUri(
        "https://example.com/invalid-twitter.json",
      );

      expect(result.isOk()).toBeFalsy();
      const error = (result as unknown as { error: InvalidMetadataError })
        .error;
      expect(error).toBeInstanceOf(InvalidMetadataError);
    });
  });
});
