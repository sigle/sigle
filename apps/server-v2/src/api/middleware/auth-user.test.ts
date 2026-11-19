import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";
import {
  createAuthenticatedClient,
  createTestWalletAddress,
} from "@/test/helpers";
import { makeTestServerLayer } from "@/test/server";

const CurrentUserResponse = Schema.Struct({
  id: Schema.String,
  address: Schema.NullOr(Schema.String),
  whitelisted: Schema.Boolean,
});

const ErrorResponse = Schema.Struct({ message: Schema.String });

describe("userAuthMiddleware", () => {
  it.effect("returns 401 when no session is provided", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      const response = yield* client.get("/api/protected/me");

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

      expect(response.status).toBe(401);
      expect(body.message).toBe("Unauthorized");
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("provides the current user for whitelisted users", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();

      const response = yield* client.get("/api/protected/me");

      const body =
        yield* HttpClientResponse.schemaBodyJson(CurrentUserResponse)(response);

      expect(response.status).toBe(200);
      expect(body).toStrictEqual({
        id: userId,
        address: null,
        whitelisted: true,
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("returns the primary wallet address of the current user", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();

      // The secondary wallet is linked first so the oldest wallet is not the
      // primary one.
      yield* createTestWalletAddress({
        userId,
        address: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
        isPrimary: false,
      });
      yield* createTestWalletAddress({
        userId,
        address: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        chainId: 1,
      });

      const response = yield* client.get("/api/protected/me");

      const body =
        yield* HttpClientResponse.schemaBodyJson(CurrentUserResponse)(response);

      expect(body.address).toBe("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM");
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("reports non-whitelisted users", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();

      const response = yield* client.get("/api/protected/me");

      const body =
        yield* HttpClientResponse.schemaBodyJson(CurrentUserResponse)(response);

      expect(response.status).toBe(200);
      expect(body).toStrictEqual({
        id: userId,
        address: null,
        whitelisted: false,
      });
    }).pipe(Effect.provide(makeTestServerLayer({ STACKS_ENV: "mainnet" }))),
  );

  it.effect("returns 403 when the user is not whitelisted", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const response = yield* client.get("/api/protected/drafts");

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

      expect(response.status).toBe(403);
      expect(body.message).toBe("User is not whitelisted");
    }).pipe(Effect.provide(makeTestServerLayer({ STACKS_ENV: "mainnet" }))),
  );
});
