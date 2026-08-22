import { bytesToHex } from "@stacks/common";
import { hashMessage } from "@stacks/encryption";
import { STACKS_MOCKNET, STACKS_TESTNET } from "@stacks/network";
import {
  privateKeyToPublic,
  publicKeyToAddress,
  signMessageHashRsv,
} from "@stacks/transactions";
import { matchError } from "better-result";
import { describe, expect, it } from "vite-plus/test";
import { PostMetadataSchemaId } from "./config.js";
import { InvalidSignatureError } from "./errors.js";
import { type PostMetadata } from "./post.js";
import {
  type VerifyPostSignatureResult,
  verifyPostSignature,
} from "./verify-post-signature.js";

// Consistent test private key (valid 32-byte hex + compressed byte)
const TEST_PRIVATE_KEY =
  "7287ba251d44a4d3fd9276c88ce3476c5aa9c784807a54ec29d5fa0605340d0f01";
const TEST_PUBLIC_KEY = privateKeyToPublic(TEST_PRIVATE_KEY) as string;
const EXPECTED_MAINNET_ADDRESS = publicKeyToAddress(TEST_PUBLIC_KEY, "mainnet");
const EXPECTED_TESTNET_ADDRESS = publicKeyToAddress(TEST_PUBLIC_KEY, "testnet");

function createSignedPostMetadata(
  contentOverrides?: Partial<PostMetadata["content"]>,
): PostMetadata {
  const metadataWithoutSignature = {
    $schema: PostMetadataSchemaId.LATEST,
    content: {
      id: "post-test-123",
      title: "Hello World",
      content: "# Content here",
      ...contentOverrides,
    },
  };

  const message = JSON.stringify(metadataWithoutSignature);
  const messageHash = bytesToHex(hashMessage(message));
  const signature = signMessageHashRsv({
    messageHash,
    privateKey: TEST_PRIVATE_KEY,
  });

  return {
    ...metadataWithoutSignature,
    signature,
  };
}

describe(verifyPostSignature, () => {
  it("should verify valid signature and return recovered address on mainnet by default", () => {
    const signedMetadata = createSignedPostMetadata();

    const result = verifyPostSignature(signedMetadata);

    expect(result.isOk()).toBe(true);
    const value = (result as unknown as { value: VerifyPostSignatureResult })
      .value;
    expect(value).toStrictEqual<VerifyPostSignatureResult>({
      recoveredAddress: EXPECTED_MAINNET_ADDRESS,
      publicKey: TEST_PUBLIC_KEY,
      signature: signedMetadata.signature!,
    });
  });

  it("should recover testnet address when testnet network option is passed", () => {
    const signedMetadata = createSignedPostMetadata();

    const result = verifyPostSignature(signedMetadata, { network: "testnet" });

    expect(result.isOk()).toBe(true);
    const value = (result as unknown as { value: VerifyPostSignatureResult })
      .value;
    expect(value.recoveredAddress).toBe(EXPECTED_TESTNET_ADDRESS);
  });

  it("should recover testnet address when devnet network option is passed", () => {
    const signedMetadata = createSignedPostMetadata();

    const result = verifyPostSignature(signedMetadata, { network: "devnet" });

    expect(result.isOk()).toBe(true);
    const value = (result as unknown as { value: VerifyPostSignatureResult })
      .value;
    expect(value.recoveredAddress).toBe(EXPECTED_TESTNET_ADDRESS);
  });

  it("should recover testnet address when mocknet network option is passed", () => {
    const signedMetadata = createSignedPostMetadata();

    const result = verifyPostSignature(signedMetadata, { network: "mocknet" });

    expect(result.isOk()).toBe(true);
    const value = (result as unknown as { value: VerifyPostSignatureResult })
      .value;
    expect(value.recoveredAddress).toBe(EXPECTED_TESTNET_ADDRESS);
  });

  it("should recover testnet address when StacksNetwork object is passed", () => {
    const signedMetadata = createSignedPostMetadata();

    const resultTestnet = verifyPostSignature(signedMetadata, {
      network: STACKS_TESTNET,
    });
    const valTestnet = (
      resultTestnet as unknown as { value: VerifyPostSignatureResult }
    ).value;
    expect(valTestnet.recoveredAddress).toBe(EXPECTED_TESTNET_ADDRESS);

    const resultMocknet = verifyPostSignature(signedMetadata, {
      network: STACKS_MOCKNET,
    });
    const valMocknet = (
      resultMocknet as unknown as { value: VerifyPostSignatureResult }
    ).value;
    expect(valMocknet.recoveredAddress).toBe(EXPECTED_TESTNET_ADDRESS);
  });

  it("should return InvalidSignatureError when signature is missing", () => {
    const unsignedMetadata = {
      $schema: PostMetadataSchemaId.LATEST,
      content: {
        id: "post-test-123",
        title: "Hello World",
        content: "# Content here",
      },
    };

    const result = verifyPostSignature(unsignedMetadata);

    expect(result.isOk()).toBe(false);
    const err = (result as unknown as { error: InvalidSignatureError }).error;
    expect(err).toBeInstanceOf(InvalidSignatureError);
    expect(InvalidSignatureError.is(err)).toBe(true);
    expect(err._tag).toBe("InvalidSignatureError");
    expect(err.message).toBe("Invalid signature: Signature is required");
  });

  it("should recover a different address when content is tampered", () => {
    const signedMetadata = createSignedPostMetadata();

    const tamperedMetadata: PostMetadata = {
      ...signedMetadata,
      content: {
        ...signedMetadata.content,
        title: "Tampered Title",
      },
    };

    const result = verifyPostSignature(tamperedMetadata);

    expect(result.isOk()).toBe(true);
    const value = (result as unknown as { value: VerifyPostSignatureResult })
      .value;
    expect(value.recoveredAddress).not.toBe(EXPECTED_MAINNET_ADDRESS);
  });

  it("should return InvalidSignatureError when signature is malformed and preserve cause", () => {
    const malformedMetadata = {
      $schema: PostMetadataSchemaId.LATEST,
      content: {
        id: "post-test-123",
        title: "Hello World",
        content: "# Content here",
      },
      signature: "not-a-valid-hex-signature",
    };

    const result = verifyPostSignature(malformedMetadata);

    expect(result.isOk()).toBe(false);
    const err = (result as unknown as { error: InvalidSignatureError }).error;
    expect(err).toBeInstanceOf(InvalidSignatureError);
    expect(err.error).toContain(
      "Invalid signature: Failed to recover signature:",
    );
    expect(err.cause).toBeDefined();
  });

  it("should support exhaustive pattern matching with better-result matchError", () => {
    const unsignedMetadata = {
      content: { id: "test" },
    };

    const result = verifyPostSignature(unsignedMetadata);
    const err = (result as unknown as { error: InvalidSignatureError }).error;

    const formatted = matchError(err, {
      InvalidSignatureError: (e) => `Handled: ${e.message}`,
    });
    expect(formatted).toBe("Handled: Invalid signature: Signature is required");
  });
});
