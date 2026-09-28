import { hashMessage } from "@stacks/encryption";
import {
  getAddressFromPrivateKey,
  makeRandomPrivKey,
  signMessageHashRsv,
} from "@stacks/transactions";
import { Effect, Ref, Schema } from "effect";
import {
  Cookies,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "effect/unstable/http";
import { createSiwsMessage } from "sign-in-with-stacks";
import { Database } from "@/db";
import { draft, user } from "@/db/schema";

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
}) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [created] = yield* db
      .insert(draft)
      .values({
        id: options.id ?? crypto.randomUUID(),
        title: options.title ?? "Test Draft",
        content: options.content ?? "Test content",
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

const NonceResponse = Schema.Struct({ nonce: Schema.String });

const VerifyResponse = Schema.Struct({
  user: Schema.Struct({ id: Schema.String }),
});

/**
 * Creates an HTTP client that persists the session cookies set by
 * `better-auth` during the SIWS handshake.
 */
export const createAuthenticatedClient = Effect.gen(function* () {
  const cookies = yield* Ref.make(Cookies.empty);

  return (yield* HttpClient.HttpClient).pipe(
    HttpClient.withCookiesRef(cookies),
  );
});

/**
 * Signs in with the SIWS endpoints and returns the authenticated user id.
 */
export const signInWithStacks = (
  client: HttpClient.HttpClient,
  credentials: TestSiwsCredentials,
) =>
  Effect.gen(function* () {
    const nonceResponse = yield* client.execute(
      HttpClientRequest.post("/api/auth/siws/nonce").pipe(
        HttpClientRequest.bodyJsonUnsafe({}),
      ),
    );

    const { nonce } =
      yield* HttpClientResponse.schemaBodyJson(NonceResponse)(nonceResponse);

    const message = createTestSiwsMessage({
      address: credentials.address,
      nonce,
      chainId: credentials.chainId,
    });

    const signature = signTestSiwsMessage(message, credentials.privateKey);

    const verifyResponse = yield* client.execute(
      HttpClientRequest.post("/api/auth/siws/verify").pipe(
        HttpClientRequest.bodyJsonUnsafe({ message, signature }),
      ),
    );

    const body =
      yield* HttpClientResponse.schemaBodyJson(VerifyResponse)(verifyResponse);

    return body.user.id;
  });
