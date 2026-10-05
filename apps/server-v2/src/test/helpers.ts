import { PostMetadataSchemaId, ProfileMetadataSchemaId } from "@sigle/sdk";
import { hashMessage } from "@stacks/encryption";
import {
  getAddressFromPrivateKey,
  makeRandomPrivKey,
  signMessageHashRsv,
} from "@stacks/transactions";
import { makeSignature } from "better-auth/crypto";
import { Effect, Redacted, Ref } from "effect";
import { Cookies, HttpClient } from "effect/http";
import { createSiwsMessage } from "sign-in-with-stacks";
import { AppConfig } from "@/config";
import { Database } from "@/db";
import {
  draft,
  mediaImage,
  post,
  postOts,
  profile,
  session,
  user,
  walletAddress,
} from "@/db/schema";
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

export const createTestWalletAddress = (options: {
  readonly id?: string;
  readonly userId: string;
  readonly address: string;
  readonly chainId?: number;
  readonly isPrimary?: boolean;
}) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [created] = yield* db
      .insert(walletAddress)
      .values({
        id: options.id ?? crypto.randomUUID(),
        userId: options.userId,
        address: options.address,
        chainId: options.chainId ?? STACKS_TESTNET_CHAIN_ID,
        isPrimary: options.isPrimary ?? true,
        createdAt: new Date(),
      })
      .returning();

    return created;
  });

export const createTestDraft = (options: {
  readonly id?: string;
  readonly userId: string;
  readonly title?: string;
  readonly content?: string;
  readonly arweaveTxId?: string | null;
  readonly txStatus?: string | null;
  readonly publishSignature?: string | null;
  readonly uploadClaimedAt?: Date | null;
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
        arweaveTxId: options.arweaveTxId ?? null,
        txStatus: options.txStatus ?? null,
        publishSignature: options.publishSignature ?? null,
        uploadClaimedAt: options.uploadClaimedAt ?? null,
        createdAt: options.createdAt,
        updatedAt: options.updatedAt,
        userId: options.userId,
      })
      .returning();

    return created;
  });

export const createTestProfile = (options: {
  readonly userId: string;
  readonly walletAddressId: string;
  readonly arweaveTxId?: string;
  readonly signature?: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly website?: string;
  readonly twitter?: string;
  readonly picture?: string;
  readonly coverPicture?: string;
}) =>
  Effect.gen(function* () {
    const db = yield* Database;
    const now = new Date();

    const [created] = yield* db
      .insert(profile)
      .values({
        userId: options.userId,
        walletAddressId: options.walletAddressId,
        arweaveTxId: options.arweaveTxId ?? crypto.randomUUID(),
        signature: options.signature ?? crypto.randomUUID(),
        displayName: options.displayName ?? "Test Profile",
        description: options.description ?? "Test description",
        website: options.website ?? null,
        twitter: options.twitter ?? null,
        picture: options.picture ?? null,
        coverPicture: options.coverPicture ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return created;
  });

export const createTestMediaImage = (options: {
  readonly id: string;
  readonly status?: "PENDING" | "READY" | "FAILED";
  readonly mimeType?: string | null;
  readonly width?: number | null;
  readonly height?: number | null;
  readonly size?: number | null;
  readonly thumbhash?: string | null;
  readonly updatedAt?: Date;
}) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [created] = yield* db
      .insert(mediaImage)
      .values({
        id: options.id,
        status: options.status ?? "PENDING",
        mimeType: options.mimeType ?? null,
        width: options.width ?? null,
        height: options.height ?? null,
        size: options.size ?? null,
        thumbhash: options.thumbhash ?? null,
        updatedAt: options.updatedAt,
      })
      .returning();

    return created;
  });

export const createTestPost = (options: {
  readonly id?: string;
  readonly draftId?: string | null;
  readonly userId: string;
  readonly arweaveTxId?: string;
  readonly version?: string;
  readonly arweaveBlockHeight?: number | null;
  readonly metadataUri?: string;
  readonly title?: string;
  readonly content?: string;
  readonly excerpt?: string;
  readonly signature?: string | null;
}) =>
  Effect.gen(function* () {
    const db = yield* Database;
    const id = options.id ?? crypto.randomUUID();
    const arweaveTxId = options.arweaveTxId ?? id;

    const [created] = yield* db
      .insert(post)
      .values({
        id,
        draftId: options.draftId ?? null,
        version: options.version ?? "1.0.0",
        arweaveTxId,
        arweaveBlockHeight: options.arweaveBlockHeight ?? null,
        metadataUri: options.metadataUri ?? `ar://${arweaveTxId}`,
        title: options.title ?? "Test Post",
        content: options.content ?? "Test post content",
        excerpt: options.excerpt ?? "Test excerpt",
        signature: options.signature ?? null,
        userId: options.userId,
      })
      .returning();

    return created;
  });

export const createTestPostOts = (options: {
  readonly postId: string;
  readonly status?: "PENDING" | "UPGRADED" | "FAILED";
  readonly contentHash?: string;
  readonly pendingProof?: Buffer | null;
  readonly otsTxId?: string | null;
  readonly updatedAt?: Date;
}) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [created] = yield* db
      .insert(postOts)
      .values({
        postId: options.postId,
        status: options.status ?? "PENDING",
        contentHash: options.contentHash ?? "a".repeat(64),
        pendingProof: options.pendingProof ?? null,
        otsTxId: options.otsTxId ?? null,
        updatedAt: options.updatedAt,
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

interface TestProfileMetadataContent {
  id: string;
  displayName: string;
  picture?: string;
  coverPicture?: string;
}

export const createSignedTestProfileMetadata = (options: {
  readonly privateKey: string;
  readonly id?: string;
  readonly displayName?: string;
  readonly picture?: string;
  readonly coverPicture?: string;
}) => {
  const content: TestProfileMetadataContent = {
    id: options.id ?? "profile-1",
    displayName: options.displayName ?? "Test profile",
  };

  if (options.picture !== undefined) {
    content.picture = options.picture;
  }

  if (options.coverPicture !== undefined) {
    content.coverPicture = options.coverPicture;
  }

  const metadataWithoutSignature = {
    $schema: ProfileMetadataSchemaId.LATEST,
    content,
  };

  const signature = signTestSiwsMessage(
    JSON.stringify(metadataWithoutSignature),
    options.privateKey,
  );

  return {
    ...metadataWithoutSignature,
    signature,
  };
};

export const createSignedTestPostMetadata = (options: {
  readonly draftId: string;
  readonly privateKey: string;
  readonly title?: string;
  readonly content?: string;
  readonly tags?: Array<string>;
}) => {
  const metadataWithoutSignature = {
    $schema: PostMetadataSchemaId.LATEST,
    content: {
      id: options.draftId,
      title: options.title ?? "Published Title",
      content: options.content ?? "Hello **Arweave** world!",
      tags: options.tags ?? ["web3", "effect"],
    },
  };

  const signature = signTestSiwsMessage(
    JSON.stringify(metadataWithoutSignature),
    options.privateKey,
  );

  return {
    ...metadataWithoutSignature,
    signature,
  };
};

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
