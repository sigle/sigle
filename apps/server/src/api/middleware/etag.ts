import { Effect, Predicate } from "effect";
import {
  HttpMiddleware,
  HttpRouter,
  HttpServerRequest,
  HttpServerResponse,
} from "effect/http";
import { createHash } from "node:crypto";

/**
 * `Cache-Control` of public reads. `EtagLayer` adds their ETag, so clients
 * revalidate them once stale.
 */
export const PUBLIC_CACHE_CONTROL = "public, max-age=60";

// Headers a 304 repeats from the 200 it stands for (RFC 9110 §15.4.5).
const NOT_MODIFIED_HEADERS = ["cache-control", "etag", "vary"];

const entityTag = /(?:W\/)?"[^"]*"/g;

/**
 * Weak comparison of `If-None-Match` (RFC 9110 §13.1.2): proxies that
 * compress responses, such as Cloudflare, send the ETag back as weak.
 */
const matchesIfNoneMatch = (ifNoneMatch: string, etag: string) =>
  ifNoneMatch.trim() === "*" ||
  (ifNoneMatch.match(entityTag) ?? []).some(
    (candidate) => candidate.replace(/^W\//, "") === etag,
  );

/**
 * Adds an ETag, the hash of the body, to the successful `GET` responses that
 * handlers mark as publicly cacheable with `Cache-Control`, and answers a
 * matching `If-None-Match` with a 304. The ETag changes with any field of the
 * response, including the image placeholders filled in after a write.
 */
const etagMiddleware = HttpMiddleware.make((app) =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    const response = yield* app;

    if (
      request.method !== "GET" ||
      response.status !== 200 ||
      !/\bpublic\b/.test(response.headers["cache-control"] ?? "") ||
      !Predicate.isTagged(response.body, "Uint8Array")
    ) {
      return response;
    }

    const etag = `"${createHash("sha256").update(response.body.body).digest("base64url")}"`;
    const ifNoneMatch = request.headers["if-none-match"];

    if (ifNoneMatch === undefined || !matchesIfNoneMatch(ifNoneMatch, etag)) {
      return HttpServerResponse.setHeader(response, "etag", etag);
    }

    return HttpServerResponse.empty({
      status: 304,
      headers: Object.fromEntries(
        NOT_MODIFIED_HEADERS.flatMap((name) => {
          const value = name === "etag" ? etag : response.headers[name];

          return value === undefined ? [] : [[name, value]];
        }),
      ),
    });
  }),
);

export const EtagLayer = HttpRouter.middleware(etagMiddleware, {
  global: true,
});
