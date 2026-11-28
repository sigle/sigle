import { hexToBytes } from "@stacks/common";
import { verifyMessageSignatureRsv } from "@stacks/encryption";
import {
  publicKeyFromSignatureRsv,
  publicKeyToAddress,
} from "@stacks/transactions";
import { Result } from "better-result";
import type { PostSignatureNetwork } from "./post-signature.js";
import type { PostMetadata } from "./post.js";
import { InvalidSignatureError } from "./errors.js";
import { postSignatureHash } from "./post-signature.js";

export interface VerifyMetadataSignatureOptions {
  network?: PostSignatureNetwork;
}

export interface VerifyMetadataSignatureResult {
  recoveredAddress: string;
  publicKey: string;
  signature: string;
}

/**
 * Checks the SIP-018 signature of post metadata and returns the address of
 * the wallet that signed it. The caller checks that address is the author's.
 */
export function verifyMetadataSignature(
  metadata: Pick<PostMetadata, "$schema" | "content" | "signature">,
  options?: VerifyMetadataSignatureOptions,
): Result<VerifyMetadataSignatureResult, InvalidSignatureError> {
  const { signature } = metadata;

  if (!signature) {
    return Result.err(
      new InvalidSignatureError({
        error: "Invalid signature: Signature is required",
      }),
    );
  }

  try {
    const network = options?.network ?? "mainnet";
    const messageHash = postSignatureHash(metadata, network);
    const publicKey = publicKeyFromSignatureRsv(messageHash, signature);
    const recoveredAddress = publicKeyToAddress(publicKey, network);

    const isSignatureValid = verifyMessageSignatureRsv({
      signature,
      message: hexToBytes(messageHash),
      publicKey,
    });

    if (!isSignatureValid) {
      return Result.err(
        new InvalidSignatureError({
          error: "Invalid signature: Signature verification failed",
        }),
      );
    }

    return Result.ok({ recoveredAddress, publicKey, signature });
  } catch (error) {
    return Result.err(
      new InvalidSignatureError({
        error: `Invalid signature: Failed to recover signature: ${
          error instanceof Error ? error.message : error
        }`,
        cause: error,
      }),
    );
  }
}
