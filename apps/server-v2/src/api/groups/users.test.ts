import { describe, expect, it } from "@effect/vitest";
import { DateTime, Effect, Option, Schema } from "effect";
import {
  Headers,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/http";
import { UserProfileResponse } from "@/api/groups/users";
import {
  createTestMediaImage,
  createTestProfile,
  createTestUser,
  createTestWalletAddress,
} from "@/test/helpers";
import { makeTestServerLayer } from "@/test/server";

const ErrorResponse = Schema.Struct({ message: Schema.String });

const TEST_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

const getUserRequest = (client: HttpClient.HttpClient, username: string) =>
  client.execute(HttpClientRequest.get(`/api/users/${username}`));

describe("users", () => {
  it.effect("GET /api/users/:username rejects an invalid Stacks address", () =>
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

  it.effect("GET /api/users/:username returns 404 for an unknown address", () =>
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

  it.effect("GET /api/users/:username returns a user without a profile", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const user = yield* createTestUser();

      yield* createTestWalletAddress({
        userId: user.id,
        address: TEST_ADDRESS,
      });

      const response = yield* getUserRequest(client, TEST_ADDRESS);

      const body =
        yield* HttpClientResponse.schemaBodyJson(UserProfileResponse)(response);

      expect({ status: response.status, body }).toStrictEqual({
        status: 200,
        body: {
          address: TEST_ADDRESS,
          profile: null,
        },
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("GET /api/users/:username returns the profile", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const user = yield* createTestUser();

      const wallet = yield* createTestWalletAddress({
        userId: user.id,
        address: TEST_ADDRESS,
      });

      yield* createTestProfile({
        userId: user.id,
        walletAddressId: wallet.id,
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
        yield* HttpClientResponse.schemaBodyJson(UserProfileResponse)(response);

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
    "GET /api/users/:username returns image placeholders and versions the ETag",
    () =>
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        const user = yield* createTestUser();

        const wallet = yield* createTestWalletAddress({
          userId: user.id,
          address: TEST_ADDRESS,
        });

        const picture = "https://cdn.example.com/avatar.webp?v=1";
        const coverPicture = "https://cdn.example.com/cover.webp?v=2";

        yield* createTestProfile({
          userId: user.id,
          walletAddressId: wallet.id,
          arweaveTxId: "arweave-profile-tx",
          picture,
          coverPicture,
        });

        const pictureUpdatedAt = new Date("2026-01-01T00:00:00.000Z");
        const coverUpdatedAt = new Date("2026-01-02T00:00:00.000Z");

        yield* createTestMediaImage({
          id: picture,
          status: "READY",
          width: 100,
          height: 100,
          thumbhash: "avatar-thumbhash",
          updatedAt: pictureUpdatedAt,
        });

        yield* createTestMediaImage({
          id: coverPicture,
          status: "READY",
          width: 2000,
          height: 1000,
          thumbhash: "cover-thumbhash",
          updatedAt: coverUpdatedAt,
        });

        const response = yield* getUserRequest(client, TEST_ADDRESS);

        const body =
          yield* HttpClientResponse.schemaBodyJson(UserProfileResponse)(
            response,
          );

        const etag = Option.getOrUndefined(
          Headers.get(response.headers, "etag"),
        );

        expect({
          picture: body.profile?.picture,
          coverPicture: body.profile?.coverPicture,
          etag,
        }).toStrictEqual({
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
          etag: `"arweave-profile-tx-${pictureUpdatedAt.getTime()}.${coverUpdatedAt.getTime()}"`,
        });
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("GET /api/users/:username returns caching headers", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const user = yield* createTestUser();

      const wallet = yield* createTestWalletAddress({
        userId: user.id,
        address: TEST_ADDRESS,
      });

      yield* createTestProfile({
        userId: user.id,
        walletAddressId: wallet.id,
        arweaveTxId: "arweave-profile-tx",
        displayName: "Alice",
      });

      const response = yield* getUserRequest(client, TEST_ADDRESS);

      const cacheControl = Option.getOrUndefined(
        Headers.get(response.headers, "cache-control"),
      );

      const etag = Option.getOrUndefined(Headers.get(response.headers, "etag"));

      expect({
        status: response.status,
        cacheControl,
        etag,
      }).toStrictEqual({
        status: 200,
        cacheControl: "public, max-age=60",
        etag: '"arweave-profile-tx"',
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );
});
