import { bytesToHex } from "@stacks/common";
import { hashMessage, verifyMessageSignatureRsv } from "@stacks/encryption";
import {
  STACKS_MAINNET,
  type StacksNetwork,
  type StacksNetworkName,
} from "@stacks/network";
import {
  createMessageSignature,
  publicKeyFromSignatureRsv,
  publicKeyToAddress,
} from "@stacks/transactions";
import { Result } from "better-result";
import { InvalidSignatureError } from "./errors.js";

export interface VerifyPostSignatureOptions {
  network?: "mainnet" | "testnet" | StacksNetworkName | StacksNetwork;
}

export interface VerifyPostSignatureResult {
  recoveredAddress: string;
  publicKey: string;
  signature: string;
}

export function verifyPostSignature(
  metadata: {
    signature?: string;
    content: unknown;
  },
  options?: VerifyPostSignatureOptions,
): Result<VerifyPostSignatureResult, InvalidSignatureError> {
  const { signature, ...metadataToSign } = metadata;

  if (!signature) {
    return Result.err(
      new InvalidSignatureError({
        error: "Invalid signature: Signature is required",
      }),
    );
  }

  try {
    const message = JSON.stringify(metadataToSign);
    const messageHash = bytesToHex(hashMessage(message));
    const stacksSignature = createMessageSignature(signature);
    const publicKey = publicKeyFromSignatureRsv(
      messageHash,
      stacksSignature.data,
    );

    let stacksNetwork: "mainnet" | "testnet" = "mainnet";
    if (typeof options?.network === "string") {
      stacksNetwork =
        options.network === "testnet" ||
        options.network === "devnet" ||
        options.network === "mocknet"
          ? "testnet"
          : "mainnet";
    } else if (options?.network) {
      stacksNetwork =
        options.network.chainId === STACKS_MAINNET.chainId
          ? "mainnet"
          : "testnet";
    }

    const recoveredAddress = publicKeyToAddress(publicKey, stacksNetwork);

    const isSignatureValid = verifyMessageSignatureRsv({
      signature,
      message,
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
