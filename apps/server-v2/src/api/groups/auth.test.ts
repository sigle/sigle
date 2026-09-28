import { describe, expect, it } from "@effect/vitest";
import { eq } from "drizzle-orm";
import { Effect, Schema } from "effect";
import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/unstable/http";
import { Database } from "@/db";
import { session, user, verification, walletAddress } from "@/db/schema";
import {
  createTestSiwsCredentials,
  createTestSiwsMessage,
  signTestSiwsMessage,
} from "@/test/helpers";
import { makeTestServerLayer } from "@/test/server";

const NonceResponse = Schema.Struct({ nonce: Schema.String });

const VerifyResponse = Schema.Struct({
  token: Schema.String,
  success: Schema.Boolean,
  user: Schema.Struct({
    id: Schema.String,
    walletAddress: Schema.String,
    chainId: Schema.Finite,
  }),
});

const ErrorResponse = Schema.Struct({ message: Schema.String });

type SiwsRequestBody = Record<string, string>;

const postJson = (url: string, body: SiwsRequestBody) =>
  HttpClientRequest.post(url).pipe(HttpClientRequest.bodyJsonUnsafe(body));

const requestNonce = (client: HttpClient.HttpClient) =>
  client
    .execute(postJson("/api/auth/siws/nonce", {}))
    .pipe(Effect.flatMap(HttpClientResponse.schemaBodyJson(NonceResponse)));

const requestVerify = (
  client: HttpClient.HttpClient,
  payload: { message: string; signature: string },
) => client.execute(postJson("/api/auth/siws/verify", payload));

describe("auth siws", () => {
  it.effect("POST /api/auth/siws/nonce creates and stores a nonce", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const db = yield* Database;

      const response = yield* client.execute(
        postJson("/api/auth/siws/nonce", {}),
      );

      const body =
        yield* HttpClientResponse.schemaBodyJson(NonceResponse)(response);

      const [stored] = yield* db
        .select()
        .from(verification)
        .where(eq(verification.identifier, `siws:${body.nonce}`));

      expect(response.status).toBe(200);
      expect(body.nonce).toMatch(/^[a-zA-Z0-9]{8,}$/);
      expect(stored.value).toBe(body.nonce);
      expect(stored.expiresAt.getTime()).toBeGreaterThan(Date.now());
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("rejects nonce requests with wallet inputs", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const { address } = createTestSiwsCredentials();

      const response = yield* client.execute(
        postJson("/api/auth/siws/nonce", { walletAddress: address }),
      );

      expect(response.status).toBe(400);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect(
    "POST /api/auth/siws/verify verifies the signature and creates a session",
    () =>
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        const db = yield* Database;
        const { address, privateKey, chainId } = createTestSiwsCredentials();

        const { nonce } = yield* requestNonce(client);
        const message = createTestSiwsMessage({ address, nonce, chainId });
        const signature = signTestSiwsMessage(message, privateKey);

        const response = yield* requestVerify(client, { message, signature });

        const body =
          yield* HttpClientResponse.schemaBodyJson(VerifyResponse)(response);

        const [createdUser] = yield* db
          .select()
          .from(user)
          .where(eq(user.id, body.user.id));

        const [createdWallet] = yield* db
          .select()
          .from(walletAddress)
          .where(eq(walletAddress.userId, body.user.id));

        const [createdSession] = yield* db
          .select()
          .from(session)
          .where(eq(session.token, body.token));

        const remainingNonces = yield* db
          .select()
          .from(verification)
          .where(eq(verification.identifier, `siws:${nonce}`));

        expect(response.status).toBe(200);
        expect({
          success: body.success,
          walletAddress: body.user.walletAddress,
          chainId: body.user.chainId,
          userName: createdUser.name,
          userEmail: createdUser.email,
          hasLastLoginAt: createdUser.lastLoginAt instanceof Date,
          wallet: {
            userId: createdWallet.userId,
            address: createdWallet.address,
            chainId: createdWallet.chainId,
            isPrimary: createdWallet.isPrimary,
          },
          sessionUserId: createdSession.userId,
          remainingNonces,
        }).toStrictEqual({
          success: true,
          walletAddress: address,
          chainId,
          userName: address,
          userEmail: `${address.toLowerCase()}@siws.placeholder.invalid`,
          hasLastLoginAt: true,
          wallet: {
            userId: body.user.id,
            address,
            chainId,
            isPrimary: true,
          },
          sessionUserId: body.user.id,
          remainingNonces: [],
        });
      }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("POST /api/auth/siws/verify consumes the nonce only once", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const { address, privateKey, chainId } = createTestSiwsCredentials();

      const { nonce } = yield* requestNonce(client);
      const message = createTestSiwsMessage({ address, nonce, chainId });
      const signature = signTestSiwsMessage(message, privateKey);

      const first = yield* requestVerify(client, { message, signature });
      const second = yield* requestVerify(client, { message, signature });

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(second);

      expect(first.status).toBe(200);
      expect(second.status).toBe(401);
      expect(body.message).toBe("Unauthorized: Invalid or expired nonce");
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("POST /api/auth/siws/verify rejects an invalid signature", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const { address, chainId } = createTestSiwsCredentials();
      const { privateKey: otherPrivateKey } = createTestSiwsCredentials();

      const { nonce } = yield* requestNonce(client);
      const message = createTestSiwsMessage({ address, nonce, chainId });
      const signature = signTestSiwsMessage(message, otherPrivateKey);

      const response = yield* requestVerify(client, { message, signature });

      const body =
        yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(response);

      expect(response.status).toBe(401);
      expect(body.message).toBe("Unauthorized: Invalid SIWS signature");
    }).pipe(Effect.provide(makeTestServerLayer())),
  );
});
