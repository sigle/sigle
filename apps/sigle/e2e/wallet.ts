import type { BrowserContext } from "@playwright/test";
import { hashMessage } from "@stacks/encryption";
import {
  Cl,
  compressPublicKey,
  getAddressFromPrivateKey,
  privateKeyToPublic,
  signMessageHashRsv,
  signStructuredData,
} from "@stacks/transactions";
import { createHash } from "node:crypto";

export interface TestWallet {
  readonly address: string;
  readonly privateKey: string;
  readonly publicKey: string;
}

/** Name the wallet is listed under in the wallet selection of Stacks Connect. */
export const TEST_WALLET_NAME = "E2E Wallet";

/**
 * A testnet wallet whose private key is the hash of `seed`: a seed always
 * gives the same wallet, and no test wallet holds anything.
 */
export const createTestWallet = (seed: string): TestWallet => {
  // The trailing `01` marks the key as compressed, as wallets use them.
  const privateKey = `${createHash("sha256")
    .update(`sigle-e2e-wallet:${seed}`)
    .digest("hex")}01`;

  return {
    address: getAddressFromPrivateKey(privateKey, "testnet"),
    privateKey,
    publicKey: compressPublicKey(privateKeyToPublic(privateKey)),
  };
};

/**
 * Signs a message the way a Stacks wallet answers `stx_signMessage`: the RSV
 * signature of the prefixed message hash.
 */
export const signMessage = (wallet: TestWallet, message: string): string =>
  signMessageHashRsv({
    messageHash: Buffer.from(hashMessage(message)).toString("hex"),
    privateKey: wallet.privateKey,
  });

/**
 * Signs SIP-018 structured data the way a Stacks wallet answers
 * `stx_signStructuredMessage`. Stacks Connect sends the message and domain as
 * serialized Clarity values in hex.
 */
export const signStructuredMessage = (
  wallet: TestWallet,
  message: string,
  domain: string,
): string =>
  signStructuredData({
    message: Cl.deserialize(message),
    domain: Cl.deserialize(domain),
    privateKey: wallet.privateKey,
  });

interface WalletAccount {
  readonly address: string;
  readonly name: string;
  readonly publicKey: string;
}

interface WalletRequestParams {
  readonly message?: string;
  readonly domain?: string;
}

type WalletResult =
  | {
      readonly addresses: ReadonlyArray<{
        readonly address: string;
        readonly publicKey: string;
        readonly symbol: string;
      }>;
    }
  | { readonly publicKey: string; readonly signature: string };

interface WalletResponse {
  readonly id: string;
  readonly jsonrpc: "2.0";
  readonly result: WalletResult;
}

declare global {
  interface Window {
    SigleE2EWallet?: {
      request: (
        method: string,
        params?: WalletRequestParams,
      ) => Promise<WalletResponse>;
    };
    sigleE2ESignMessage?: (message: string) => Promise<string>;
    sigleE2ESignStructuredMessage?: (
      message: string,
      domain: string,
    ) => Promise<string>;
    wbip_providers?: Array<{ id: string; name: string; icon: string }>;
  }
}

/**
 * Runs in the page before its own scripts. Registers a wallet the way a
 * browser extension does (WBIP-004): Stacks Connect lists the providers of
 * `window.wbip_providers` and calls the one the user picks.
 *
 * Serialized by Playwright, so it can only use its argument.
 */
const registerWalletProvider = (account: WalletAccount) => {
  window.SigleE2EWallet = {
    request: async (method, params) => {
      if (method === "getAddresses") {
        return {
          id: crypto.randomUUID(),
          jsonrpc: "2.0",
          result: {
            addresses: [
              {
                symbol: "STX",
                address: account.address,
                publicKey: account.publicKey,
              },
            ],
          },
        };
      }

      if (
        method === "stx_signMessage" &&
        params?.message !== undefined &&
        window.sigleE2ESignMessage
      ) {
        return {
          id: crypto.randomUUID(),
          jsonrpc: "2.0",
          result: {
            signature: await window.sigleE2ESignMessage(params.message),
            publicKey: account.publicKey,
          },
        };
      }

      if (
        method === "stx_signStructuredMessage" &&
        params?.message !== undefined &&
        params.domain !== undefined &&
        window.sigleE2ESignStructuredMessage
      ) {
        return {
          id: crypto.randomUUID(),
          jsonrpc: "2.0",
          result: {
            signature: await window.sigleE2ESignStructuredMessage(
              params.message,
              params.domain,
            ),
            publicKey: account.publicKey,
          },
        };
      }

      throw new Error(`The e2e wallet does not support ${method}`);
    },
  };

  window.wbip_providers = [
    {
      id: "SigleE2EWallet",
      name: account.name,
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E",
    },
  ];
};

/**
 * Makes `wallet` the wallet installed in every page of the context. The app
 * talks to it through Stacks Connect like to any wallet, and it approves every
 * request. The private key stays in the test process, which signs for the page.
 */
export const installWallet = async (
  context: BrowserContext,
  wallet: TestWallet,
): Promise<void> => {
  await context.exposeFunction("sigleE2ESignMessage", (message: string) =>
    signMessage(wallet, message),
  );

  await context.exposeFunction(
    "sigleE2ESignStructuredMessage",
    (message: string, domain: string) =>
      signStructuredMessage(wallet, message, domain),
  );

  await context.addInitScript(registerWalletProvider, {
    address: wallet.address,
    name: TEST_WALLET_NAME,
    publicKey: wallet.publicKey,
  });
};
