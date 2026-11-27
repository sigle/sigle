import { Result } from "better-result";
import { sigleApiFetchClient } from "@/lib/sigle";

const PUBLISH_POLLING_INTERVAL_MILLIS = 2000;

const PUBLISH_TIMEOUT_MILLIS = 180_000;

export const waitForPublishCompletion = async (
  draftId: string,
  {
    timeoutMillis = PUBLISH_TIMEOUT_MILLIS,
    pollIntervalMillis = PUBLISH_POLLING_INTERVAL_MILLIS,
    signal,
  }: {
    timeoutMillis?: number;
    pollIntervalMillis?: number;
    /** Stops polling, for example when the dialog following it unmounts. */
    signal?: AbortSignal;
  } = {},
) => {
  const deadline = Date.now() + timeoutMillis;

  const timedOut = Result.err({
    message: "Publishing timed out, please try again",
  });

  const cancelled = Result.err({
    message: "Publishing status check was cancelled",
    cancelled: true as const,
  });

  while (Date.now() < deadline) {
    if (signal?.aborted) {
      return cancelled;
    }

    // A status request that never answers must not outlive the deadline.
    const timeoutSignal = AbortSignal.timeout(deadline - Date.now());
    const requestSignal = signal
      ? AbortSignal.any([timeoutSignal, signal])
      : timeoutSignal;

    const response = await sigleApiFetchClient
      .GET("/api/drafts/{draftId}/publish", {
        params: {
          path: {
            draftId,
          },
        },
        signal: requestSignal,
      })
      // openapi-fetch throws on network errors and aborts instead of returning
      // `response.error`.
      .catch(() => {
        if (signal?.aborted) {
          return "cancelled" as const;
        }

        return timeoutSignal.aborted
          ? ("timeout" as const)
          : ("failed" as const);
      });

    if (response === "cancelled") {
      return cancelled;
    }

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
      return Result.err({
        message: "Failed to publish post",
        failed: true as const,
      });
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

    if (signal?.aborted) {
      return cancelled;
    }
  }

  return timedOut;
};
