import { expect, test, vi } from "vitest";
import type { SiwsMessage } from "./types.js";
import { validateSiwsMessage } from "./validateSiwsMessage.js";

const message = {
  address: "SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173",
  chainId: 1,
  domain: "example.com",
  nonce: "foobarbaz",
  uri: "https://example.com/path",
  version: "1",
} satisfies SiwsMessage;

test("default", () => {
  expect(
    validateSiwsMessage({
      message,
    }),
  ).toBeTruthy();
});

test("behavior: invalid address", () => {
  expect(
    validateSiwsMessage({
      message: {
        ...message,
        address: undefined,
      },
    }),
  ).toBeFalsy();
});

test("behavior: address mismatch", () => {
  expect(
    validateSiwsMessage({
      address: "SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ172",
      message,
    }),
  ).toBeFalsy();
});

test("behavior: invalid address", () => {
  expect(
    validateSiwsMessage({
      address: "0xfoobarbaz",
      message,
    }),
  ).toBeFalsy();
});

test("behavior: domain mismatch", () => {
  expect(
    validateSiwsMessage({
      domain: "viem.sh",
      message,
    }),
  ).toBeFalsy();
});

test("behavior: nonce mismatch", () => {
  expect(
    validateSiwsMessage({
      nonce: "f0obarbaz",
      message,
    }),
  ).toBeFalsy();
});

test("behavior: scheme mismatch", () => {
  expect(
    validateSiwsMessage({
      scheme: "http",
      message: {
        ...message,
        scheme: "https",
      },
    }),
  ).toBeFalsy();
});

test("behavior: time is after expirationTime", () => {
  expect(
    validateSiwsMessage({
      message: {
        ...message,
        expirationTime: new Date(Date.UTC(2024, 1, 1)),
      },
      time: new Date(Date.UTC(2025, 1, 1)),
    }),
  ).toBeFalsy();
});

test("behavior: time is before notBefore", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)));

  expect(
    validateSiwsMessage({
      message: {
        ...message,
        notBefore: new Date(Date.UTC(2024, 1, 1)),
      },
      time: new Date(Date.UTC(2023, 1, 1)),
    }),
  ).toBeFalsy();

  vi.useRealTimers();
});
