import { type MediaImageMetadata, PostMetadataSchema } from "@sigle/sdk";
import { type UnhandledException, Result, TaggedError } from "better-result";
import { resolveImageUrl } from "./images";

export class MetadataFetchFailedError extends TaggedError(
  "MetadataFetchFailedError",
)<{
  error: string;
}>() {}

function fetchMetadata(
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
          error:
            error instanceof Error
              ? `Failed to fetch metadata from ${url}: ${error.message}`
              : `Failed to fetch metadata from ${url}: ${String(error)}`,
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
  error: string;
}>() {}

interface PostMetadata {
  id: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  excerpt: string;
  coverImage?: MediaImageMetadata;
  tags?: string[];
  canonicalUri?: string;
}

export async function getMetadataFromUri(
  baseTokenUri: string,
): Promise<
  Result<
    PostMetadata,
    MetadataFetchFailedError | InvalidMetadataError | UnhandledException
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

  const metadata: PostMetadata = {
    id: postData.content.id,
    title: postData.content.title,
    content: postData.content.content,
    metaTitle,
    metaDescription,
    excerpt: excerpt || "",
    coverImage: postData.content.coverImage,
    tags: postData.content.tags,
    canonicalUri,
  };

  return Result.ok(metadata);
}
