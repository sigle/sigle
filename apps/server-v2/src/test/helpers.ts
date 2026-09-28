import { hashMessage } from "@stacks/encryption";
import {
  getAddressFromPrivateKey,
  makeRandomPrivKey,
  signMessageHashRsv,
} from "@stacks/transactions";
import { makeSignature } from "better-auth/crypto";
import { Effect, Redacted, Ref } from "effect";
import { Cookies, HttpClient } from "effect/unstable/http";
import { createSiwsMessage } from "sign-in-with-stacks";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import { draft, session, user } from "@/db/schema";
import { SESSION_COOKIE_NAME } from "@/services/auth";

export const createTestUser = (
  overrides: Partial<typeof user.$inferInsert> = {},
) =>
  Effect.gen(function* () {
    const db = yield* Database;
    const id = crypto.randomUUID();

    const [created] = yield* db
      .insert(user)
      .values({
        id,
        name: "Test User",
        email: `${id}@test.sigle.io`,
        ...overrides,
      })
      .returning();

    return created;
  });

export const createTestDraft = (options: {
  readonly id?: string;
  readonly userId: string;
  readonly title?: string;
  readonly content?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [created] = yield* db
      .insert(draft)
      .values({
        id: options.id ?? crypto.randomUUID(),
        title: options.title ?? "Test Draft",
        content: options.content ?? "Test content",
        createdAt: options.createdAt,
        updatedAt: options.updatedAt,
        userId: options.userId,
      })
      .returning();

    return created;
  });

const STACKS_MAINNET_CHAIN_ID = 1;

const STACKS_TESTNET_CHAIN_ID = 2_147_483_648;

export interface TestSiwsCredentials {
  readonly privateKey: string;
  readonly address: string;
  readonly chainId: number;
}

export const createTestSiwsCredentials = (
  network: "mainnet" | "testnet" = "testnet",
): TestSiwsCredentials => {
  const privateKey = makeRandomPrivKey();

  return {
    privateKey,
    address: getAddressFromPrivateKey(privateKey, network),
    chainId:
      network === "mainnet" ? STACKS_MAINNET_CHAIN_ID : STACKS_TESTNET_CHAIN_ID,
  };
};

export const createTestSiwsMessage = (options: {
  readonly address: string;
  readonly nonce: string;
  readonly chainId: number;
}): string =>
  createSiwsMessage({
    address: options.address,
    chainId: options.chainId,
    domain: "localhost:3000",
    statement: "Sign in to Sigle.",
    nonce: options.nonce,
    uri: "http://localhost:3000",
    version: "1",
  });

export const signTestSiwsMessage = (
  message: string,
  privateKey: string,
): string =>
  signMessageHashRsv({
    messageHash: Buffer.from(hashMessage(message)).toString("hex"),
    privateKey,
  });

const TEST_SESSION_DURATION_MILLIS = 7 * 24 * 60 * 60 * 1000;

/**
 * Creates a user, a session row and an HTTP client carrying the signed
 * `better-auth` session cookie.
 *
 * This skips the SIWS handshake so protected routes can be tested without
 * signing a message, while still exercising the real session middleware.
 */
export const createAuthenticatedClient = (options: { userId?: string } = {}) =>
  Effect.gen(function* () {
    const db = yield* Database;
    const config = yield* AppConfig;
    const user = yield* createTestUser(
      options.userId === undefined ? {} : { id: options.userId },
    );

    const token = crypto.randomUUID();
    const now = new Date();

    yield* db.insert(session).values({
      id: crypto.randomUUID(),
      token,
      userId: user.id,
      expiresAt: new Date(now.getTime() + TEST_SESSION_DURATION_MILLIS),
      createdAt: now,
      updatedAt: now,
    });

    const signature = yield* Effect.promise(() =>
      makeSignature(token, Redacted.value(config.AUTH_SECRET)),
    );

    const cookies = Cookies.setUnsafe(
      SESSION_COOKIE_NAME,
      `${token}.${signature}`,
    )(Cookies.empty);

    return {
      client: (yield* HttpClient.HttpClient).pipe(
        HttpClient.withCookiesRef(yield* Ref.make(cookies)),
      ),
      userId: user.id,
    };
  });
