import { PostMetadataSchema, type MediaImageMetadata } from "@sigle/sdk";
import { bytesToHex } from "@stacks/common";
import { hashMessage, verifyMessageSignatureRsv } from "@stacks/encryption";
import {
  createMessageSignature,
  publicKeyFromSignatureRsv,
  publicKeyToAddress,
} from "@stacks/transactions";
import { Result, type UnhandledException } from "better-result";
import { env } from "../../env";
import { resolveImageUrl } from "../images";
import {
  InvalidMetadataError,
  InvalidSignatureError,
  type MetadataFetchFailedError,
} from "./errors";
import { fetchMetadata } from "./fetch";

interface PostMetadata {
  version: string;
  id: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  excerpt: string;
  coverImage?: MediaImageMetadata;
  tags?: string[];
  canonicalUri?: string;
  signature: string;
  recoveredAddress: string;
}

export function verifyPostSignature(metadata: {
  signature: string;
  content: any;
}): Result<
  { recoveredAddress: string; publicKey: string },
  InvalidSignatureError
> {
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
    const recoveredAddress = publicKeyToAddress(
      publicKey,
      env.STACKS_ENV === "mainnet" ? "mainnet" : "testnet",
    );

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

    return Result.ok({ recoveredAddress, publicKey });
  } catch (error) {
    return Result.err(
      new InvalidSignatureError({
        error: `Invalid signature: Failed to recover signature: ${
          error instanceof Error ? error.message : error
        }`,
      }),
    );
  }
}

export async function getMetadataFromUri(
  baseTokenUri: string,
): Promise<
  Result<
    PostMetadata,
    | MetadataFetchFailedError
    | InvalidMetadataError
    | InvalidSignatureError
    | UnhandledException
  >
> {
  const url = resolveImageUrl(baseTokenUri);
  const fetchResult = await fetchMetadata(url);

  if (fetchResult.isErr()) {
    return fetchResult;
  }

  const postMetadata = PostMetadataSchema.safeParse(fetchResult.value);
  if (!postMetadata.success) {
    return Result.err(
      new InvalidMetadataError({
        error: `Invalid metadata: ${postMetadata.error.issues.length} validation error(s)`,
      }),
    );
  }
  const postData = postMetadata.data;

  const signatureResult = verifyPostSignature(postData);
  if (signatureResult.isErr()) {
    return signatureResult;
  }
  const { recoveredAddress } = signatureResult.value;
  const signature = postData.signature;

  const metaTitle = postData.content.attributes?.find(
    (attribute) => attribute.key === "meta-title",
  )?.value;
  const metaDescription = postData.content.attributes?.find(
    (attribute) => attribute.key === "meta-description",
  )?.value;
  const excerpt = postData.content.attributes?.find(
    (attribute) => attribute.key === "excerpt",
  )?.value;
  const canonicalUri = postData.content.attributes?.find(
    (attribute) => attribute.key === "canonical-uri",
  )?.value;

  const versionSplit = postData.$schema.split("/");
  const version = versionSplit[versionSplit.length - 1].replace(".json", "");
  const metadata: PostMetadata = {
    version,
    id: postData.content.id,
    title: postData.content.title,
    content: postData.content.content,
    metaTitle,
    metaDescription,
    excerpt: excerpt || "",
    coverImage: postData.content.coverImage,
    tags: postData.content.tags,
    canonicalUri,
    signature,
    recoveredAddress,
  };

  return Result.ok(metadata);
}
