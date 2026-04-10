import { ProfileMetadataSchema, type ProfileMetadata } from "@sigle/sdk";
import { Result, type UnhandledException } from "better-result";
import { resolveImageUrl } from "../images";
import { InvalidMetadataError, type MetadataFetchFailedError } from "./errors";
import { fetchMetadata } from "./fetch";

export async function getProfileMetadataFromUri(
  baseTokenUri: string,
): Promise<
  Result<
    ProfileMetadata,
    MetadataFetchFailedError | InvalidMetadataError | UnhandledException
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
  const postData = profileMetadata.data;

  return Result.ok(postData);
}
