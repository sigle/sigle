import { describe, expect, it } from "@effect/vitest";
import { eq } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";
import { Database } from "@/db";
import { walletAddress } from "@/db/schema";
import {
  createAuthenticatedClient,
  createTestSiwsCredentials,
} from "@/test/helpers";
import { makeTestServerLayer } from "@/test/server";

const CurrentUserResponse = Schema.Struct({
  id: Schema.String,
  address: Schema.String,
  whitelisted: Schema.Boolean,
  plan: Schema.Literals(["free", "pro"]),
});

const ErrorResponse = Schema.Struct({ message: Schema.String });

describe("userAuthMiddleware", () => {
  it.effect("returns 401 when no session is provided", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      const response = yield* client.get("/api/me");

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

      expect(response.status).toBe(401);
      expect(body.message).toBe("Unauthorized");
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("provides the current user for whitelisted users", () =>
    Effect.gen(function* () {
      const { client, userId, address } = yield* createAuthenticatedClient();

      const response = yield* client.get("/api/me");

      const body =
        yield* HttpClientResponse.schemaBodyJson(CurrentUserResponse)(response);

      expect(response.status).toBe(200);
      expect(body).toStrictEqual({
        id: userId,
        address,
        whitelisted: true,
        plan: "free",
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("rejects users without a linked wallet", () =>
    Effect.gen(function* () {
      const db = yield* Database;
      const { client, userId } = yield* createAuthenticatedClient();
      yield* db.delete(walletAddress).where(eq(walletAddress.userId, userId));

      const response = yield* client.get("/api/me");

      expect(response.status).toBe(500);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("reports non-whitelisted users", () =>
    Effect.gen(function* () {
      const { client, userId, address } = yield* createAuthenticatedClient();

      const response = yield* client.get("/api/me");

      const body =
        yield* HttpClientResponse.schemaBodyJson(CurrentUserResponse)(response);

      expect(response.status).toBe(200);
      expect(body).toStrictEqual({
        id: userId,
        address,
        whitelisted: false,
        plan: "free",
      });
    }).pipe(
      Effect.provide(
        makeTestServerLayer({
          STACKS_ENV: "mainnet",
          // Keeps the mainnet NFT check offline: the failed lookup reports
          // `free`.
          STACKS_API_URL: "http://127.0.0.1:9",
        }),
      ),
    ),
  );

  it.effect("whitelists mainnet wallets in WHITELISTED_ADDRESSES", () => {
    const { address } = createTestSiwsCredentials();

    return Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient({ address });

      const response = yield* client.get("/api/drafts");

      expect(response.status).toBe(200);
    }).pipe(
      Effect.provide(
        makeTestServerLayer({
          STACKS_ENV: "mainnet",
          WHITELISTED_ADDRESSES: [address],
        }),
      ),
    );
  });

  it.effect("reports the stored plan, not the wallet holdings", () => {
    const { address: eligibleAddress } = createTestSiwsCredentials();

    return Effect.gen(function* () {
      const pro = yield* createAuthenticatedClient({ plan: "pro" });

      // Eligible for Pro, but never activated it.
      const eligible = yield* createAuthenticatedClient({
        address: eligibleAddress,
      });

      const plans = yield* Effect.forEach([pro, eligible], ({ client }) =>
        client.get("/api/me").pipe(
          Effect.flatMap(
            HttpClientResponse.schemaBodyJson(CurrentUserResponse),
          ),
          Effect.map((body) => body.plan),
        ),
      );

      expect(plans).toStrictEqual(["pro", "free"]);
    }).pipe(
      Effect.provide(makeTestServerLayer({ PRO_ADDRESSES: [eligibleAddress] })),
    );
  });

  it.effect("returns 403 when the user is not whitelisted", () =>
    Effect.gen(function* () {
      const { client } = yield* createAuthenticatedClient();

      const response = yield* client.get("/api/drafts");

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

      expect(response.status).toBe(403);
      expect(body.message).toBe("User is not whitelisted");
    }).pipe(Effect.provide(makeTestServerLayer({ STACKS_ENV: "mainnet" }))),
  );
});
