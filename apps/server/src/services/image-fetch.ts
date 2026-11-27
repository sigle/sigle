import { NodeHttpClient } from "@effect/platform-node";
import { Context, Effect, Layer } from "effect";
import { FetchHttpClient, HttpClient, HttpClientRequest } from "effect/http";
import { lookupPublicAddress } from "@/lib/public-https";

/**
 * The current client, asking for uncompressed bodies: Undici does not decode
 * `Content-Encoding`, and the job reads the image bytes as sent. Decoding
 * instead would need its own limit on the decoded size.
 */
const currentHttpClient = Effect.map(
  Effect.service(HttpClient.HttpClient),
  HttpClient.mapRequest(
    HttpClientRequest.setHeader("accept-encoding", "identity"),
  ),
);

/**
 * The HTTP client of the thumbhash job, which downloads images from URLs that
 * post authors choose. It follows no redirect, so the job checks every hop.
 */
export class ImageFetchClient extends Context.Service<
  ImageFetchClient,
  HttpClient.HttpClient
>()("sigle/ImageFetchClient") {
  /**
   * Undici, with a DNS lookup that fails with `BlockedAddressError` when a
   * hostname resolves to a private or reserved address, and connects to the
   * address it checked.
   */
  static readonly layer: Layer.Layer<ImageFetchClient> = Layer.effect(
    ImageFetchClient,
    currentHttpClient,
  ).pipe(
    Layer.provide(
      NodeHttpClient.layerUndiciOptions({
        connect: { lookup: lookupPublicAddress },
      }),
    ),
  );

  /** The global `fetch`, which tests stub, following no redirect either. */
  static readonly layerTest: Layer.Layer<ImageFetchClient> = Layer.effect(
    ImageFetchClient,
    currentHttpClient,
  ).pipe(
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(
      Layer.succeed(FetchHttpClient.RequestInit, { redirect: "manual" }),
    ),
    // Read on each request, so a fetch stubbed after the layer is built applies.
    Layer.provide(
      Layer.succeed(FetchHttpClient.Fetch, (input, init) => fetch(input, init)),
    ),
  );
}
