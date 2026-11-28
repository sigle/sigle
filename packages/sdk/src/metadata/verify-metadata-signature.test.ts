import type { Result } from "better-result";
import { bytesToHex } from "@stacks/common";
import { hashMessage } from "@stacks/encryption";
import {
  privateKeyToPublic,
  publicKeyToAddress,
  signMessageHashRsv,
  signStructuredData,
} from "@stacks/transactions";
import { matchError } from "better-result";
import { describe, expect, it } from "vite-plus/test";
import type { PostSignatureNetwork } from "./post-signature.js";
import type { PostMetadata } from "./post.js";
import type { VerifyMetadataSignatureResult } from "./verify-metadata-signature.js";
import { PostMetadataSchemaId } from "./config.js";
import { InvalidSignatureError } from "./errors.js";
import {
  canonicalPostMetadataJson,
  hashPostMetadata,
  postSignatureMessage,
} from "./post-signature.js";
import { verifyMetadataSignature } from "./verify-metadata-signature.js";

// Consistent test private key (valid 32-byte hex + compressed byte)
const TEST_PRIVATE_KEY =
  "7287ba251d44a4d3fd9276c88ce3476c5aa9c784807a54ec29d5fa0605340d0f01";

const TEST_PUBLIC_KEY = String(privateKeyToPublic(TEST_PRIVATE_KEY));

const EXPECTED_MAINNET_ADDRESS = publicKeyToAddress(TEST_PUBLIC_KEY, "mainnet");

const EXPECTED_TESTNET_ADDRESS = publicKeyToAddress(TEST_PUBLIC_KEY, "testnet");

const METADATA: Omit<PostMetadata, "signature"> = {
  $schema: PostMetadataSchemaId.LATEST,
  content: {
    id: "post-test-123",
    title: "Hello World",
    content: "# Content here",
    excerpt: "Content here",
    publishedAt: "2026-11-24T10:00:00.000Z",
  },
};

function unwrapErr<T, E>(result: Result<T, E>): E {
  if (result.isErr()) {
    return result.error;
  }

  throw new Error("Expected an error result");
}

// Signs the way a wallet answers `stx_signStructuredMessage`.
function sign(
  metadata: Omit<PostMetadata, "signature">,
  network: PostSignatureNetwork = "mainnet",
): PostMetadata {
  return {
    ...metadata,
    signature: signStructuredData({
      ...postSignatureMessage(metadata, network),
      privateKey: TEST_PRIVATE_KEY,
    }),
  };
}

describe(canonicalPostMetadataJson, () => {
  it("sorts keys at every level, drops undefined and keeps array order", () => {
    expect(
      canonicalPostMetadataJson({
        signature: "sig",
        content: {
          title: 'Quote "é"\nline',
          id: "post",
          tags: ["b", "a"],
          metaTitle: undefined,
          content: "# Hi",
          excerpt: "",
          publishedAt: "2026-11-24T10:00:00.000Z",
        },
        $schema: PostMetadataSchemaId.LATEST,
      }),
    ).toBe(
      `{"$schema":"${PostMetadataSchemaId.LATEST}","content":{"content":"# Hi","excerpt":"","id":"post","publishedAt":"2026-11-24T10:00:00.000Z","tags":["b","a"],"title":"Quote \\"é\\"\\nline"},"signature":"sig"}`,
    );
  });
});

describe(verifyMetadataSignature, () => {
  it("recovers the author of a SIP-018 signature on mainnet by default", () => {
    const signed = sign(METADATA);

    expect(
      verifyMetadataSignature(signed).unwrap(),
    ).toStrictEqual<VerifyMetadataSignatureResult>({
      recoveredAddress: EXPECTED_MAINNET_ADDRESS,
      publicKey: TEST_PUBLIC_KEY,
      signature: signed.signature!,
    });
  });

  it("ties the signature to the chain it was made for", () => {
    const signed = sign(METADATA, "testnet");

    expect({
      testnet: verifyMetadataSignature(signed, { network: "testnet" }).unwrap()
        .recoveredAddress,
      mainnet: verifyMetadataSignature(signed, { network: "mainnet" }).unwrap()
        .recoveredAddress,
    }).toStrictEqual({
      testnet: EXPECTED_TESTNET_ADDRESS,
      mainnet: expect.not.stringMatching(EXPECTED_MAINNET_ADDRESS),
    });
  });

  it("verifies the same metadata with its keys in another order", () => {
    const signed = sign(METADATA);

    const reordered = {
      signature: signed.signature,
      content: {
        publishedAt: METADATA.content.publishedAt,
        excerpt: METADATA.content.excerpt,
        content: METADATA.content.content,
        title: METADATA.content.title,
        id: METADATA.content.id,
      },
      $schema: METADATA.$schema,
    };

    expect({
      hash: hashPostMetadata(reordered),
      address: verifyMetadataSignature(reordered).unwrap().recoveredAddress,
    }).toStrictEqual({
      hash: hashPostMetadata(METADATA),
      address: EXPECTED_MAINNET_ADDRESS,
    });
  });

  it("recovers a different address when the content is tampered", () => {
    const signed = sign(METADATA);

    const tampered = {
      ...signed,
      content: { ...signed.content, content: "# Tampered" },
    };

    expect(
      verifyMetadataSignature(tampered).unwrap().recoveredAddress,
    ).not.toBe(EXPECTED_MAINNET_ADDRESS);
  });

  it("rejects a plain message signature of the same JSON", () => {
    const signature = signMessageHashRsv({
      messageHash: bytesToHex(hashMessage(JSON.stringify(METADATA))),
      privateKey: TEST_PRIVATE_KEY,
    });

    // Recovery succeeds, but with another key than the author's.
    expect(
      verifyMetadataSignature({ ...METADATA, signature }).unwrap()
        .recoveredAddress,
    ).not.toBe(EXPECTED_MAINNET_ADDRESS);
  });

  it("returns InvalidSignatureError when the signature is missing", () => {
    const err = unwrapErr(verifyMetadataSignature(METADATA));

    expect({
      isError: InvalidSignatureError.is(err),
      message: err.message,
    }).toStrictEqual({
      isError: true,
      message: "Invalid signature: Signature is required",
    });
  });

  it("returns InvalidSignatureError with its cause for a malformed signature", () => {
    const err = unwrapErr(
      verifyMetadataSignature({ ...METADATA, signature: "not-a-signature" }),
    );

    expect({
      error: err.error.startsWith(
        "Invalid signature: Failed to recover signature:",
      ),
      hasCause: err.cause !== undefined,
    }).toStrictEqual({ error: true, hasCause: true });
  });

  it("supports exhaustive pattern matching with better-result matchError", () => {
    const err = unwrapErr(verifyMetadataSignature(METADATA));

    const formatted = matchError(err, {
      InvalidSignatureError: (e) => `Handled: ${e.message}`,
    });

    expect(formatted).toBe("Handled: Invalid signature: Signature is required");
  });
});
