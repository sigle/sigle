import { hashMessage } from "@stacks/encryption";
import {
  getAddressFromPrivateKey,
  makeRandomPrivKey,
  signMessageHashRsv,
} from "@stacks/transactions";
import { Effect } from "effect";
import { createSiwsMessage } from "sign-in-with-stacks";
import { Database } from "@/db";
import { user } from "@/db/schema";

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
