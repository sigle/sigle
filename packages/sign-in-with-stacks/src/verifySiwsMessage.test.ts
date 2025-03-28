import { bytesToHex } from "@stacks/common";
import { hashMessage } from "@stacks/encryption";
import { STACKS_TESTNET } from "@stacks/network";
import { signMessageHashRsv } from "@stacks/transactions";
import { expect, test } from "vitest";
import { accounts } from "../test/constants.js";
import { createSiwsMessage } from "./createSiwsMessage.js";
import { verifySiwsMessage } from "./verifySiwsMessage.js";

const account = accounts[0];

test("default", async () => {
  const message = createSiwsMessage({
    address: account.address,
    chainId: STACKS_TESTNET.chainId,
    domain: "example.com",
    nonce: "foobarbaz",
    uri: "https://example.com/path",
    version: "1",
  });

  const hash = hashMessage(message);
  const signature = signMessageHashRsv({
    messageHash: bytesToHex(hash),
    privateKey: account.privateKey,
  });

  expect(
    verifySiwsMessage({
      message,
      signature,
    }),
  ).toBeTruthy();
});

test("behavior: invalid message fields", async () => {
  const message = createSiwsMessage({
    address: account.address,
    chainId: STACKS_TESTNET.chainId,
    domain: "example.com",
    nonce: "foobarbaz",
    uri: "https://example.com/path",
    version: "1",
  });

  const hash = hashMessage(message);
  const signature = signMessageHashRsv({
    messageHash: bytesToHex(hash),
    privateKey: account.privateKey,
  });

  expect(
    verifySiwsMessage({
      domain: "viem.sh",
      message,
      signature,
    }),
  ).toBeFalsy();
});

test("behavior: invalid address not matching signature", async () => {
  const message = createSiwsMessage({
    address: "SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173",
    chainId: STACKS_TESTNET.chainId,
    domain: "example.com",
    nonce: "foobarbaz",
    uri: "https://example.com/path",
    version: "1",
  });

  const hash = hashMessage(message);
  const signature = signMessageHashRsv({
    messageHash: bytesToHex(hash),
    privateKey: account.privateKey,
  });

  expect(
    verifySiwsMessage({
      message,
      signature,
    }),
  ).toBeFalsy();
});

test("behavior: invalid message", async () => {
  const message = "foobarbaz";
  const hash = hashMessage(message);
  const signature = signMessageHashRsv({
    messageHash: bytesToHex(hash),
    privateKey: account.privateKey,
  });
  expect(
    verifySiwsMessage({
      message,
      signature,
    }),
  ).toBeFalsy();
});
