import { describe, expect, it } from "@effect/vitest";
import { getAddressFromPrivateKey } from "@stacks/transactions";
import { eq } from "drizzle-orm";
import { Effect, Option, Schema } from "effect";
import {
  Headers,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/http";
import type { PostHogEvent } from "@/services/posthog";
import { RATE_LIMITS } from "@/api/middleware/rate-limit";
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
  it.effect("POST /api/auth/siws/nonce is rate limited per IP", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const { points } = RATE_LIMITS.signIn;

      const responses = yield* Effect.forEach(
        Array.from({ length: points + 1 }),
        () => client.execute(postJson("/api/auth/siws/nonce", {})),
        { concurrency: 1 },
      );

      const last = responses[points];

      expect({
        statuses: responses.map((response) => response.status),
        body: last === undefined ? undefined : yield* last.json,
        retryAfter:
          last === undefined
            ? undefined
            : Option.getOrUndefined(Headers.get(last.headers, "retry-after")),
      }).toStrictEqual({
        statuses: [...Array.from({ length: points }, () => 200), 429],
        body: {
          message: "Rate limit exceeded",
          retryAfterMillis: expect.any(Number),
        },
        retryAfter: "60",
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("every /api/auth/siws/* path shares one rate limit per IP", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const { points } = RATE_LIMITS.signIn;

      yield* Effect.forEach(
        Array.from({ length: points }, (_, index) => index),
        (index) =>
          client.execute(postJson(`/api/auth/siws/made-up-${index}`, {})),
        { concurrency: 1 },
      );

      const nonce = yield* client.execute(postJson("/api/auth/siws/nonce", {}));

      expect(nonce.status).toBe(429);
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

  it.effect("/api/auth/* reads bodies up to 64 KiB", () =>
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      const maxBytes = 64 * 1024;

      // `{"message":"..."}` around the message takes 14 bytes.
      const verify = (bytes: number) =>
        client.execute(
          HttpClientRequest.post("/api/auth/siws/verify").pipe(
            HttpClientRequest.bodyText(
              JSON.stringify({ message: "a".repeat(bytes - 14) }),
              "application/json",
            ),
          ),
        );

      const overLimit = yield* verify(maxBytes + 1);
      // Read and handed to better-auth, which rejects the missing signature.
      const atLimit = yield* verify(maxBytes);

      expect({
        overLimit: overLimit.status,
        body: yield* HttpClientResponse.schemaBodyJson(ErrorResponse)(
          overLimit,
        ),
        atLimit: atLimit.status,
      }).toStrictEqual({
        overLimit: 413,
        body: { message: "Request body is too large." },
        atLimit: 400,
      });
    }).pipe(Effect.provide(makeTestServerLayer())),
  );

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
    () => {
      const posthogEvents: Array<PostHogEvent> = [];

      return Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        const db = yield* Database;
        const { address, privateKey, chainId } = createTestSiwsCredentials();

        const { nonce } = yield* requestNonce(client);
        const message = createTestSiwsMessage({ address, nonce, chainId });
        const signature = signTestSiwsMessage(message, privateKey);

        // The proxy forwards the client IP, which the session must not store.
        const response = yield* client.execute(
          postJson("/api/auth/siws/verify", { message, signature }).pipe(
            HttpClientRequest.setHeader("x-forwarded-for", "203.0.113.7"),
          ),
        );

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

        // Signing in again is not a new sign-up.
        const { nonce: nextNonce } = yield* requestNonce(client);

        const nextMessage = createTestSiwsMessage({
          address,
          nonce: nextNonce,
          chainId,
        });

        const nextSignIn = yield* requestVerify(client, {
          message: nextMessage,
          signature: signTestSiwsMessage(nextMessage, privateKey),
        });

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
          sessionIpAddress: createdSession.ipAddress,
          remainingNonces,
          nextSignIn: nextSignIn.status,
          posthogEvents,
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
          sessionIpAddress: "",
          remainingNonces: [],
          nextSignIn: 200,
          posthogEvents: [
            { distinctId: body.user.id, event: "user_signed_up" },
          ],
        });
      }).pipe(Effect.provide(makeTestServerLayer({}, posthogEvents)));
    },
  );

  it.effect(
    "POST /api/auth/siws/verify signs in a wallet with a 39-character address",
    () =>
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        const { chainId } = createTestSiwsCredentials();

        // About 1 in 256 addresses have 39 characters. sign-in-with-stacks
        // 0.4.0 couldn't parse them, so those wallets couldn't sign in.
        const privateKey =
          "c9184ab8c4f87ce2ceed798ef71b6db6c03f1ccd7a898acb7d71bd252ed7ab4601";

        const address = getAddressFromPrivateKey(privateKey, "testnet");

        const { nonce } = yield* requestNonce(client);
        const message = createTestSiwsMessage({ address, nonce, chainId });
        const signature = signTestSiwsMessage(message, privateKey);

        const response = yield* requestVerify(client, { message, signature });

        const body =
          yield* HttpClientResponse.schemaBodyJson(VerifyResponse)(response);

        expect([response.status, body.user.walletAddress]).toStrictEqual([
          200,
          "STX4E0VZD1M4TKS53P5D8XPTQC6152KTTX9K68C",
        ]);
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
