import { bytesToHex, utf8ToBytes } from "@stacks/common";
import { hashSha256Sync } from "@stacks/encryption";
import { STACKS_MAINNET, STACKS_TESTNET } from "@stacks/network";
import { Cl, encodeStructuredDataBytes } from "@stacks/transactions";
import type { PostMetadata } from "./post.js";

type UnsignedPostMetadata = Pick<PostMetadata, "$schema" | "content">;

/**
 * Serializes post metadata as canonical JSON, following the JSON
 * Canonicalization Scheme (RFC 8785): object keys sorted, no whitespace. Any
 * language can rebuild these bytes from the parsed metadata to check its hash.
 * The metadata has no integer-like keys, which JavaScript objects would keep
 * in numeric order instead.
 */
export const canonicalPostMetadataJson = (
  metadata: UnsignedPostMetadata & Pick<PostMetadata, "signature">,
): string =>
  JSON.stringify(metadata, (_key, value: unknown) =>
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? Object.fromEntries(
          Object.entries(value).toSorted(([a], [b]) =>
            a < b ? -1 : a > b ? 1 : 0,
          ),
        )
      : value,
  );

/**
 * Hex SHA-256 of the canonical JSON of the metadata without its signature,
 * the hash the author signs.
 */
export const hashPostMetadata = (metadata: UnsignedPostMetadata): string =>
  bytesToHex(
    hashSha256Sync(
      utf8ToBytes(
        canonicalPostMetadataJson({
          $schema: metadata.$schema,
          content: metadata.content,
        }),
      ),
    ),
  );

export type PostSignatureNetwork = "mainnet" | "testnet";

/**
 * The SIP-018 structured data the author signs to publish a post: Sigle's
 * domain, and a message naming the post with the hash of its metadata. The
 * wallet shows the post id and title instead of the whole JSON, and the
 * signature can't be reused as another kind of message.
 */
export const postSignatureMessage = (
  metadata: UnsignedPostMetadata,
  network: PostSignatureNetwork = "mainnet",
) => ({
  domain: Cl.tuple({
    name: Cl.stringAscii("Sigle"),
    version: Cl.stringAscii("1.0.0"),
    "chain-id": Cl.uint(
      (network === "mainnet" ? STACKS_MAINNET : STACKS_TESTNET).chainId,
    ),
  }),
  message: Cl.tuple({
    action: Cl.stringAscii("publish-post"),
    id: Cl.stringUtf8(metadata.content.id),
    title: Cl.stringUtf8(metadata.content.title),
    "metadata-hash": Cl.bufferFromHex(hashPostMetadata(metadata)),
  }),
});

/** Hex SHA-256 of the SIP-018 encoding of `postSignatureMessage`. */
export const postSignatureHash = (
  metadata: UnsignedPostMetadata,
  network: PostSignatureNetwork = "mainnet",
): string =>
  bytesToHex(
    hashSha256Sync(
      encodeStructuredDataBytes(postSignatureMessage(metadata, network)),
    ),
  );
