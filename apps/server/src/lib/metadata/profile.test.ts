import { InvalidSignatureError, ProfileMetadataSchemaId } from "@sigle/sdk";
import { bytesToHex } from "@stacks/common";
import { hashMessage } from "@stacks/encryption";
import {
  privateKeyToPublic,
  publicKeyToAddress,
  signMessageHashRsv,
} from "@stacks/transactions";
import { Result } from "better-result";
import { describe, expect, it, vi, beforeEach } from "vite-plus/test";
import { InvalidMetadataError, MetadataFetchFailedError } from "./errors";
import { getProfileMetadataFromUri } from "./profile";

// Consistent test private key (valid 32-byte hex + compressed byte)
const TEST_PRIVATE_KEY =
  "7287ba251d44a4d3fd9276c88ce3476c5aa9c784807a54ec29d5fa0605340d0f01";

const TEST_PUBLIC_KEY = String(privateKeyToPublic(TEST_PRIVATE_KEY));

const EXPECTED_TESTNET_ADDRESS = publicKeyToAddress(TEST_PUBLIC_KEY, "testnet");

function unwrapErr<T, E>(result: Result<T, E>): E {
  if (result.isErr()) return result.error;

  throw new Error("Expected an error result");
}

function expectInstanceOf<T, C extends new (...args: never[]) => T>(
  value: T,
  type: C,
): InstanceType<C> {
  if (value instanceof type) {
    // SAFETY: `instanceof type` guarantees the runtime match; TypeScript
    // cannot express the generic narrowing from `T` to the instance type.
    return value as InstanceType<C>;
  }

  throw new Error(`Expected instance of ${type.name}`);
}

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

function signProfileMetadata(metadata: { $schema: string; content: unknown }) {
  const message = JSON.stringify(metadata);
  const messageHash = bytesToHex(hashMessage(message));

  return signMessageHashRsv({
    messageHash,
    privateKey: TEST_PRIVATE_KEY,
  });
}

function createSignedProfileMetadata<
  T extends { $schema: string; content: unknown },
>(metadata: T): T & { signature: string } {
  return {
    ...metadata,
    signature: signProfileMetadata(metadata),
  };
}

describe("profile metadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe(getProfileMetadataFromUri, () => {
    it("should return ok result with parsed metadata and recovered address on successful fetch", async () => {
      const signedMetadata = createSignedProfileMetadata(validMetadata);

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => signedMetadata,
      });

      const result = await getProfileMetadataFromUri(
        "https://example.com/metadata.json",
      );

      expect(result.isOk()).toBe(true);
      expect(result).toStrictEqual(
        Result.ok({
          metadata: signedMetadata,
          recoveredAddress: EXPECTED_TESTNET_ADDRESS,
          signature: signedMetadata.signature,
        }),
      );
    });

    it("should return err with InvalidSignatureError when signature is missing", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => validMetadata,
      });

      const result = await getProfileMetadataFromUri(
        "https://example.com/unsigned.json",
      );

      expect(result.isOk()).toBe(false);

      const error = expectInstanceOf(unwrapErr(result), InvalidSignatureError);

      expect(error._tag).toBe("InvalidSignatureError");
      expect(error.error).toBe("Invalid signature: Signature is required");
    });

    it("should return err with MetadataFetchFailedError on fetch failure", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const result = await getProfileMetadataFromUri(
        "https://example.com/fail.json",
      );

      expect(result.isOk()).toBe(false);

      const error = expectInstanceOf(
        unwrapErr(result),
        MetadataFetchFailedError,
      );

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

      expect(result.isOk()).toBe(false);

      const error = unwrapErr(result);

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

      expect(result.isOk()).toBe(false);

      const error = expectInstanceOf(unwrapErr(result), InvalidMetadataError);
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

      expect(result.isOk()).toBe(false);

      const error = unwrapErr(result);

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

      expect(result.isOk()).toBe(false);

      const error = unwrapErr(result);

      expect(error).toBeInstanceOf(InvalidMetadataError);
      expect(error._tag).toBe("InvalidMetadataError");
    });

    it("should return ok result with minimal signed metadata", async () => {
      const minimalMetadata = {
        $schema: ProfileMetadataSchemaId.LATEST,
        content: {
          id: "profile-minimal",
        },
      };

      const signedMetadata = createSignedProfileMetadata(minimalMetadata);

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => signedMetadata,
      });

      const result = await getProfileMetadataFromUri(
        "https://example.com/minimal.json",
      );

      expect(result.isOk()).toBe(true);
      expect(result).toStrictEqual(
        Result.ok({
          metadata: signedMetadata,
          recoveredAddress: EXPECTED_TESTNET_ADDRESS,
          signature: signedMetadata.signature,
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

      expect(result.isOk()).toBe(false);

      const error = unwrapErr(result);

      expect(error).toBeInstanceOf(InvalidMetadataError);
    });
  });
});
