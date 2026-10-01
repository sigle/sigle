import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";
import { createAuthenticatedClient } from "@/test/helpers";
import { makeTestServerLayer } from "@/test/server";

const CurrentUserResponse = Schema.Struct({
  id: Schema.String,
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
      expect(body).toStrictEqual({ id: userId, whitelisted: true });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("reports non-whitelisted users", () =>
    Effect.gen(function* () {
      const { client, userId } = yield* createAuthenticatedClient();

      const response = yield* client.get("/api/protected/me");

      const body =
        yield* HttpClientResponse.schemaBodyJson(CurrentUserResponse)(response);

      expect(response.status).toBe(200);
      expect(body).toStrictEqual({ id: userId, whitelisted: false });
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
