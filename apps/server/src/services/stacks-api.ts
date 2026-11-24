import { Effect, Option, Redacted } from "effect";
import { HttpClient, HttpClientRequest } from "effect/http";
import { AppConfig } from "@/config";

export const STACKS_API_TIMEOUT = "10 seconds";

/**
 * HTTP client for `STACKS_API_URL`, sending `HIRO_API_KEY` when it is set.
 * Non-2xx responses fail.
 */
export const makeStacksApiClient = Effect.gen(function* () {
  const config = yield* AppConfig;

  return (yield* HttpClient.HttpClient).pipe(
    HttpClient.mapRequest(
      HttpClientRequest.prependUrl(config.STACKS_API_URL.replace(/\/+$/, "")),
    ),
    HttpClient.mapRequest((request) =>
      Option.match(config.HIRO_API_KEY, {
        onNone: () => request,
        onSome: (apiKey) =>
          HttpClientRequest.setHeader(
            request,
            "x-api-key",
            Redacted.value(apiKey),
          ),
      }),
    ),
    HttpClient.filterStatusOk,
  );
});
