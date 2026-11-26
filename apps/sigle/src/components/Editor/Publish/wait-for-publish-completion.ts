import { Result } from "better-result";
import { sigleApiFetchClient } from "@/lib/sigle";

const PUBLISH_POLLING_INTERVAL_MILLIS = 2_000;

const PUBLISH_TIMEOUT_MILLIS = 180_000;

export const waitForPublishCompletion = async (
  draftId: string,
  {
    timeoutMillis = PUBLISH_TIMEOUT_MILLIS,
    pollIntervalMillis = PUBLISH_POLLING_INTERVAL_MILLIS,
  }: { timeoutMillis?: number; pollIntervalMillis?: number } = {},
) => {
  const deadline = Date.now() + timeoutMillis;

  const timedOut = Result.err({
    message: "Publishing timed out, please try again",
  });

  while (Date.now() < deadline) {
    // A status request that never answers must not outlive the deadline.
    const signal = AbortSignal.timeout(deadline - Date.now());

    const response = await sigleApiFetchClient
      .GET("/api/drafts/{draftId}/publish", {
        params: {
          path: {
            draftId,
          },
        },
        signal,
      })
      // openapi-fetch throws on network errors and aborts instead of returning
      // `response.error`.
      .catch(() =>
        signal.aborted ? ("timeout" as const) : ("failed" as const),
      );

    if (response === "timeout") {
      return timedOut;
    }

    if (response === "failed") {
      return Result.err({
        message: "Failed to check the publishing status, please try again",
      });
    }

    if (response.error) {
      return Result.err({ message: response.error.message });
    }

    const { data } = response;

    if (data.status === "failed") {
      return Result.err({ message: "Failed to publish post" });
    }

    if (data.status === "completed" && data.postId) {
      return Result.ok({
        postId: data.postId,
        arweaveTxId: data.arweaveTxId,
      });
    }

    await new Promise((resolve) => {
      setTimeout(resolve, pollIntervalMillis);
    });
  }

  return timedOut;
};
