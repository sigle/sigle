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
import { z } from "zod";
import { SignatureSchema, Tagchema } from "./common.js";
import { PostMetadataSchemaId } from "./config.js";
import { InvalidSignatureError } from "./errors.js";
import {
  type MarketplaceMetadata,
  MarketplaceMetadataSchema,
} from "./marketplace.js";
import { type MediaImageMetadata, MediaImageMetadataSchema } from "./media.js";
import {
  type MetadataAttribute,
  MetadataAttributeSchema,
} from "./metadata-attribute.js";
import { evaluate } from "./utils.js";

export enum ContentWarning {
  NSFW = "NSFW",
  SENSITIVE = "SENSITIVE",
  SPOILER = "SPOILER",
}

export const ContentWarningSchema = z.enum(ContentWarning).meta({
  description: "Specify a content warning.",
});

export interface PostMetadataDetails {
  /**
   * Random id also used in the url
   * Have to be unique on sigle. Use a UUID if unsure.
   */
  id: string;
  /**
   * Post title
   */
  title: string;
  /**
   * Markdown content
   */
  content: string;
  /**
   * List of attributes that can be used to store any additional information that is not supported by the standard.
   */
  attributes?: MetadataAttribute[];
  /**
   * The cover image
   */
  coverImage?: MediaImageMetadata;
  /**
   * An arbitrary list of tags.
   */
  tags?: string[];
  /**
   * Specify a content warning
   */
  contentWarning?: ContentWarning;
}

export const PostMetadataDetailsSchema = z.object({
  id: z.string().min(1).meta({
    description: "Random id also used in the url. Have to be unique on sigle.",
  }),
  title: z.string().min(1).meta({
    description: "Post title.",
  }),
  content: z.string().min(1).meta({
    description: "Markdown content.",
  }),
  attributes: MetadataAttributeSchema.array().min(1).max(20).optional().meta({
    description:
      "List of attributes that can be used to store any additional information that is not supported by the standard",
  }),
  coverImage: MediaImageMetadataSchema.optional().meta({
    description: "The cover image.",
  }),
  tags: Tagchema.array().min(1).max(5).optional().meta({
    description: "An arbitrary list of tags.",
  }),
  contentWarning: ContentWarningSchema.optional(),
});

export type PostMetadata = MarketplaceMetadata & {
  /**
   * The schema id.
   */
  $schema: PostMetadataSchemaId.LATEST;
  /**
   * The metadata details.
   */
  content: PostMetadataDetails;
  /**
   * A cryptographic signature of the `content` data.
   */
  signature?: string;
};

export const PostMetadataSchema = MarketplaceMetadataSchema.extend({
  $schema: z.literal(PostMetadataSchemaId.LATEST),
  content: PostMetadataDetailsSchema,
  signature: SignatureSchema.optional(),
});

export function createPostMetadata(data: PostMetadata): PostMetadata {
  return evaluate(PostMetadataSchema.safeParse(data));
}

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
