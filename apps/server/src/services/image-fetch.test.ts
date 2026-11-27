import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { ImageFetchClient } from "@/services/image-fetch";

describe("ImageFetchClient", () => {
  // `localhost` passes as a hostname but resolves to loopback addresses, as
  // a public name pointed at a private address would.
  it.live("refuses a hostname that resolves to a blocked address", () =>
    Effect.gen(function* () {
      const client = yield* ImageFetchClient;
      const error = yield* client.get("https://localhost:9/").pipe(Effect.flip);

      expect(error.cause).toMatchObject({
        _tag: "BlockedAddressError",
        hostname: "localhost",
      });
    }).pipe(Effect.provide(ImageFetchClient.layer)),
  );
});
