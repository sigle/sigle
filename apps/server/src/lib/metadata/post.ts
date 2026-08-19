import {
  InvalidSignatureError,
  PostMetadataSchema,
  verifyPostSignature,
  type MediaImageMetadata,
} from "@sigle/sdk";
import { Result, type UnhandledException } from "better-result";
import { env } from "../../env";
import { resolveImageUrl } from "../images";
import { InvalidMetadataError, type MetadataFetchFailedError } from "./errors";
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

  const signatureResult = verifyPostSignature(postData, {
    network: env.STACKS_ENV === "mainnet" ? "mainnet" : "testnet",
  });
  if (signatureResult.isErr()) {
    return signatureResult;
  }
  const { recoveredAddress, signature } = signatureResult.value;

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
