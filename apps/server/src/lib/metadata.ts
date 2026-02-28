import type { ZodError } from "zod-validation-error";
import { type MediaImageMimeType, PostMetadataSchema } from "@sigle/sdk";
import { type UnhandledException, Result, TaggedError } from "better-result";
import { resolveImageUrl } from "./images";

export class MetadataFetchFailedError extends TaggedError(
  "MetadataFetchFailedError",
)<{
  error: string;
}>() {}

function fetchMetatadata(
  url: string,
): Promise<Result<unknown, MetadataFetchFailedError>> {
  return Result.tryPromise(
    {
      try: async () => {
        const response = await fetch(url);
        const json = await response.json();
        return json;
      },
      catch: (error) => {
        return new MetadataFetchFailedError({
          error: error instanceof Error ? error.message : String(error),
        });
      },
    },
    {
      retry: {
        times: 3,
        backoff: "exponential",
        delayMs: 500,
      },
    },
  );
}

export class InvalidMetadataError extends TaggedError("InvalidMetadataError")<{
  id: string;
  error: ZodError;
}>() {}

interface PostMetadata {
  id: string;
}

export async function getMetadataFromUri(
  baseTokenUri: string,
): Promise<
  Result<
    PostMetadata,
    MetadataFetchFailedError | InvalidMetadataError | UnhandledException
  >
> {
  return Result.tryPromise(async () => {
    const url = resolveImageUrl(baseTokenUri);
    const result = await fetchMetatadata(url);
    if (result.isErr()) {
      return result;
    }

    // Verify data is correct
    const postMetadata = PostMetadataSchema.safeParse(result.value);
    if (!postMetadata.success) {
      return Result.err(
        new InvalidMetadataError({
          id: "invalid_metadata",
          error: postMetadata.error,
        }),
      );
    }
    const postData = postMetadata.data;

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

    const metadata = {
      id: postData.content.id,
      title: postData.content.title,
      content: postData.content.content,
      metaTitle,
      metaDescription,
      excerpt: excerpt || "",
      coverImage: postData.content.coverImage,
      tags: postData.content.tags,
      canonicalUri,
    } satisfies PostMetadata;

    return Result.ok(metadata);
  });
}
