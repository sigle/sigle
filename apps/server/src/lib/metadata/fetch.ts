import { Result } from "better-result";
import { env } from "@/env";
import { MetadataFetchFailedError } from "./errors";

export function fetchMetadata(
  url: string,
): Promise<Result<unknown, MetadataFetchFailedError>> {
  const retryConfig =
    env.NODE_ENV === "test"
      ? undefined
      : ({
          retry: {
            times: 3,
            backoff: "exponential",
            delayMs: 500,
          },
        } as const);

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
    retryConfig,
  );
}
