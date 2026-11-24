import { describe, expect, it } from "@effect/vitest";
import { DateTime, Effect, Option, Schema } from "effect";
import {
  Headers,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/http";
import { PublicUser } from "@/api/groups/users";
import {
  createTestMediaImage,
  createTestProfile,
  createTestUser,
  createTestWalletAddress,
} from "@/test/helpers";
import { makeTestServerLayer } from "@/test/server";

const ErrorResponse = Schema.Struct({ message: Schema.String });

const TEST_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

const SECONDARY_ADDRESS = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";

const FREE_ADDRESS = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";

const getUserRequest = (client: HttpClient.HttpClient, address: string) =>
  client.execute(HttpClientRequest.get(`/api/users/${address}`));

describe("users", () => {
  it.effect("GET /api/users/:address rejects an invalid Stacks address", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      const response = yield* getUserRequest(client, "not-an-address");

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

      expect({ status: response.status, message: body.message }).toStrictEqual({
        status: 400,
        message: "Invalid Stacks address",
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("GET /api/users/:address returns 404 for an unknown address", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      const response = yield* getUserRequest(client, TEST_ADDRESS);

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

      expect({ status: response.status, message: body.message }).toStrictEqual({
        status: 404,
        message: "User not found",
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("GET /api/users/:address returns a user without a profile", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const user = yield* createTestUser();

      yield* createTestWalletAddress({
        userId: user.id,
        address: TEST_ADDRESS,
      });

      const response = yield* getUserRequest(client, TEST_ADDRESS);

      const body =
        yield* HttpClientResponse.schemaBodyJson(PublicUser)(response);

      expect({ status: response.status, body }).toStrictEqual({
        status: 200,
        body: {
          address: TEST_ADDRESS,
          profile: null,
          isExplorer: false,
        },
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "GET /api/users/:address gives the Explorer Guild badge to every wallet of a Pro user",
    () =>
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        const pro = yield* createTestUser({ plan: "pro" });
        const free = yield* createTestUser();

        yield* createTestWalletAddress({
          userId: pro.id,
          address: TEST_ADDRESS,
        });
        // A secondary wallet of the Pro user, with its own profile.
        yield* createTestWalletAddress({
          userId: pro.id,
          address: SECONDARY_ADDRESS,
          isPrimary: false,
        });
        yield* createTestProfile({
          address: SECONDARY_ADDRESS,
          arweaveTxId: "arweave-profile-tx",
          displayName: "Nemo",
        });
        yield* createTestWalletAddress({
          userId: free.id,
          address: FREE_ADDRESS,
        });

        const isExplorer = (address: string) =>
          getUserRequest(client, address).pipe(
            Effect.flatMap(HttpClientResponse.schemaBodyJson(PublicUser)),
            Effect.map((body) => body.isExplorer),
          );

        expect({
          primary: yield* isExplorer(TEST_ADDRESS),
          secondary: yield* isExplorer(SECONDARY_ADDRESS),
          free: yield* isExplorer(FREE_ADDRESS),
        }).toStrictEqual({ primary: true, secondary: true, free: false });
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "GET /api/users/:address reads a non-canonical address spelling",
    () =>
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;

        yield* createTestProfile({
          address: TEST_ADDRESS,
          arweaveTxId: "arweave-profile-tx",
          displayName: "Alice",
        });

        // `O` decodes to the same address as `0`.
        const response = yield* getUserRequest(
          client,
          TEST_ADDRESS.replaceAll("0", "O"),
        );

        const body =
          yield* HttpClientResponse.schemaBodyJson(PublicUser)(response);

        expect({
          status: response.status,
          address: body.address,
          displayName: body.profile?.displayName,
        }).toStrictEqual({
          status: 200,
          address: TEST_ADDRESS,
          displayName: "Alice",
        });
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "GET /api/users/:address returns a profile whose signer has no account",
    () =>
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;

        yield* createTestProfile({
          address: TEST_ADDRESS,
          arweaveTxId: "arweave-profile-tx",
          displayName: "Alice",
          description: "Hello",
          website: "https://example.com",
          twitter: "alice",
          picture: "https://cdn.example.com/avatar.webp",
          coverPicture: "https://cdn.example.com/cover.webp",
        });

        const response = yield* getUserRequest(client, TEST_ADDRESS);

        const body =
          yield* HttpClientResponse.schemaBodyJson(PublicUser)(response);

        expect(body).toMatchObject({
          address: TEST_ADDRESS,
          profile: {
            displayName: "Alice",
            description: "Hello",
            website: "https://example.com",
            twitter: "alice",
            picture: {
              url: "https://cdn.example.com/avatar.webp",
              width: null,
              height: null,
              thumbhash: null,
            },
            coverPicture: {
              url: "https://cdn.example.com/cover.webp",
              width: null,
              height: null,
              thumbhash: null,
            },
            arweaveTxId: "arweave-profile-tx",
          },
        });
        expect(response.status).toBe(200);
        expect(DateTime.isDateTime(body.profile?.updatedAt)).toBe(true);
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "GET /api/users/:address returns image placeholders and versions the ETag",
    () =>
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;

        const picture = "https://cdn.example.com/avatar.webp?v=1";
        const coverPicture = "https://cdn.example.com/cover.webp?v=2";

        yield* createTestProfile({
          address: TEST_ADDRESS,
          arweaveTxId: "arweave-profile-tx",
          picture,
          coverPicture,
        });

        const before = yield* getUserRequest(client, TEST_ADDRESS);

        const beforeEtag = Option.getOrUndefined(
          Headers.get(before.headers, "etag"),
        );

        // The placeholders are filled in after the profile is stored.
        yield* createTestMediaImage({
          id: picture,
          status: "READY",
          width: 100,
          height: 100,
          thumbhash: "avatar-thumbhash",
        });

        yield* createTestMediaImage({
          id: coverPicture,
          status: "READY",
          width: 2000,
          height: 1000,
          thumbhash: "cover-thumbhash",
        });

        // Revalidating the copy cached before the placeholders gets them.
        const response = yield* client.execute(
          HttpClientRequest.get(`/api/users/${TEST_ADDRESS}`).pipe(
            HttpClientRequest.setHeader("if-none-match", beforeEtag ?? ""),
          ),
        );

        const body =
          yield* HttpClientResponse.schemaBodyJson(PublicUser)(response);

        const etag = Option.getOrUndefined(
          Headers.get(response.headers, "etag"),
        );

        expect({
          status: response.status,
          picture: body.profile?.picture,
          coverPicture: body.profile?.coverPicture,
          etagChanged: beforeEtag !== undefined && etag !== beforeEtag,
        }).toStrictEqual({
          status: 200,
          picture: {
            url: picture,
            width: 100,
            height: 100,
            thumbhash: "avatar-thumbhash",
          },
          coverPicture: {
            url: coverPicture,
            width: 2000,
            height: 1000,
            thumbhash: "cover-thumbhash",
          },
          etagChanged: true,
        });
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "GET /api/users/:address answers a matching If-None-Match with a 304",
    () =>
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;

        yield* createTestProfile({
          address: TEST_ADDRESS,
          arweaveTxId: "arweave-profile-tx",
          displayName: "Alice",
        });

        const response = yield* getUserRequest(client, TEST_ADDRESS);

        const etag = Option.getOrUndefined(
          Headers.get(response.headers, "etag"),
        );

        const revalidate = (ifNoneMatch: string) =>
          client
            .execute(
              HttpClientRequest.get(`/api/users/${TEST_ADDRESS}`).pipe(
                HttpClientRequest.setHeaders({
                  origin: "http://localhost:3000",
                  "if-none-match": ifNoneMatch,
                }),
              ),
            )
            .pipe(
              Effect.flatMap((revalidated) =>
                Effect.map(revalidated.text, (text) => ({
                  status: revalidated.status,
                  body: text,
                  etag: Option.getOrUndefined(
                    Headers.get(revalidated.headers, "etag"),
                  ),
                  cacheControl: Option.getOrUndefined(
                    Headers.get(revalidated.headers, "cache-control"),
                  ),
                  allowOrigin: Option.getOrUndefined(
                    Headers.get(
                      revalidated.headers,
                      "access-control-allow-origin",
                    ),
                  ),
                  rateLimit: Option.getOrUndefined(
                    Headers.get(revalidated.headers, "x-ratelimit-limit"),
                  ),
                })),
              ),
            );

        const notModified = {
          status: 304,
          body: "",
          etag,
          cacheControl: "public, max-age=60",
          allowOrigin: "http://localhost:3000",
          // A 304 still counts against the rate limit, so it tells the client.
          rateLimit: "60",
        };

        expect({
          status: response.status,
          cacheControl: Option.getOrUndefined(
            Headers.get(response.headers, "cache-control"),
          ),
          etag,
          matching: yield* revalidate(etag ?? ""),
          // Proxies that compress the response weaken its ETag.
          weak: yield* revalidate(`"other", W/${etag ?? ""}`),
          other: (yield* revalidate('"other"')).status,
        }).toStrictEqual({
          status: 200,
          cacheControl: "public, max-age=60",
          etag: expect.stringMatching(/^"[\w-]{43}"$/),
          matching: notModified,
          weak: notModified,
          other: 200,
        });
      }).pipe(Effect.provide(makeTestServerLayer())),
  );
});
