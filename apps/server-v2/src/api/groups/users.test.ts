import { describe, expect, it } from "@effect/vitest";
import { DateTime, Effect, Schema } from "effect";
import { HttpClient, HttpClientRequest, HttpClientResponse } from "effect/http";
import { UserProfileResponse } from "@/api/groups/users";
import {
  createTestPost,
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
  it.effect("GET /api/users/:username returns 404 for an unknown address", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      const response = yield* getUserRequest(client, "STUNKNOWN");

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
          postsCount: 0,
        },
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("GET /api/users/:username returns the profile and post count", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const user = yield* createTestUser();

      yield* createTestWalletAddress({
        userId: user.id,
        address: TEST_ADDRESS,
      });
      yield* createTestProfile({
        userId: user.id,
        address: TEST_ADDRESS,
        displayName: "Alice",
        description: "Hello",
        website: "https://example.com",
        twitter: "alice",
        picture: "https://cdn.example.com/avatar.webp",
        coverPicture: "https://cdn.example.com/cover.webp",
      });
      yield* createTestPost({ userId: user.id, title: "First post" });
      yield* createTestPost({ userId: user.id, title: "Second post" });

      const response = yield* getUserRequest(client, TEST_ADDRESS);

      const body =
        yield* HttpClientResponse.schemaBodyJson(UserProfileResponse)(response);

      expect(body).toMatchObject({
        address: TEST_ADDRESS,
        postsCount: 2,
        profile: {
          displayName: "Alice",
          description: "Hello",
          website: "https://example.com",
          twitter: "alice",
          picture: "https://cdn.example.com/avatar.webp",
          coverPicture: "https://cdn.example.com/cover.webp",
        },
      });
      expect(response.status).toBe(200);
      expect(DateTime.isDateTime(body.profile?.updatedAt)).toBe(true);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );
});
