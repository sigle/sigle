import { Effect, type Schema } from "effect";
import {
  HttpClient,
  HttpClientResponse,
  type HttpClientRequest,
} from "effect/http";

export interface JsonHttpResponse {
  readonly status?: number | undefined;
  readonly body: Schema.Json;
}

/**
 * Builds an in-memory `HttpClient` that answers requests with JSON, used by
 * service test layers so tests never touch the network.
 */
export const makeJsonHttpClient = (
  respond: (
    request: HttpClientRequest.HttpClientRequest,
    url: URL,
  ) => JsonHttpResponse,
): HttpClient.HttpClient =>
  HttpClient.make((request, url) =>
    Effect.sync(() => {
      const { status = 200, body } = respond(request, url);

      return HttpClientResponse.fromWeb(
        request,
        new Response(JSON.stringify(body), {
          status,
          headers: { "content-type": "application/json" },
        }),
      );
    }),
  );
