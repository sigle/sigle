import {
  ProfileMetadataSchema,
  verifyPostSignature,
  type InvalidSignatureError,
  type ProfileMetadata,
} from "@sigle/sdk";
import { Result, type UnhandledException } from "better-result";
import { env } from "../../env";
import { resolveImageUrl } from "../images";
import { InvalidMetadataError, type MetadataFetchFailedError } from "./errors";
import { fetchMetadata } from "./fetch";

export interface VerifiedProfileMetadata {
  metadata: ProfileMetadata;
  recoveredAddress: string;
  signature: string;
}

export async function getProfileMetadataFromUri(
  baseTokenUri: string,
): Promise<
  Result<
    VerifiedProfileMetadata,
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

  const profileMetadata = ProfileMetadataSchema.safeParse(fetchResult.value);

  if (!profileMetadata.success) {
    return Result.err(
      new InvalidMetadataError({
        error: `Invalid metadata: ${profileMetadata.error.issues.length} validation error(s)`,
      }),
    );
  }

  const signatureResult = verifyPostSignature(profileMetadata.data, {
    network: env.STACKS_ENV === "mainnet" ? "mainnet" : "testnet",
  });

  if (signatureResult.isErr()) {
    return signatureResult;
  }

  const { recoveredAddress, signature } = signatureResult.value;

  return Result.ok({
    metadata: profileMetadata.data,
    recoveredAddress,
    signature,
  });
}
