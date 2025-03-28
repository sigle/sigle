import { STACKS_MAINNET } from "@stacks/network";
import { expect, test, vi } from "vitest";
import { createSiwsMessage } from "./createSiwsMessage.js";
import type { SiwsMessage } from "./types.js";

const message = {
  address: "SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173",
  chainId: STACKS_MAINNET.chainId,
  domain: "example.com",
  nonce: "foobarbaz",
  uri: "https://example.com/path",
  version: "1",
} satisfies SiwsMessage;

test("default", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)));

  expect(createSiwsMessage(message)).toMatchInlineSnapshot(`
    "example.com wants you to sign in with your Stacks account:
    SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173


    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2023-02-01T00:00:00.000Z"
  `);

  vi.useRealTimers();
});

test("parameters: domain", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)));

  expect(
    createSiwsMessage({
      ...message,
      domain: "foo.example.com",
    }),
  ).toMatchInlineSnapshot(`
    "foo.example.com wants you to sign in with your Stacks account:
    SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173


    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2023-02-01T00:00:00.000Z"
  `);

  expect(
    createSiwsMessage({
      ...message,
      domain: "example.co.uk",
    }),
  ).toMatchInlineSnapshot(`
    "example.co.uk wants you to sign in with your Stacks account:
    SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173


    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2023-02-01T00:00:00.000Z"
  `);

  vi.useRealTimers();
});

test("parameters: scheme", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)));

  expect(
    createSiwsMessage({
      ...message,
      scheme: "https",
    }),
  ).toMatchInlineSnapshot(`
    "https://example.com wants you to sign in with your Stacks account:
    SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173


    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2023-02-01T00:00:00.000Z"
  `);

  vi.useRealTimers();
});

test("parameters: statement", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)));

  expect(
    createSiwsMessage({
      ...message,
      statement:
        "I accept the ExampleOrg Terms of Service: https://example.com/tos",
    }),
  ).toMatchInlineSnapshot(`
    "example.com wants you to sign in with your Stacks account:
    SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173

    I accept the ExampleOrg Terms of Service: https://example.com/tos

    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2023-02-01T00:00:00.000Z"
  `);

  vi.useRealTimers();
});

test("parameters: issuedAt", () => {
  const issuedAt = new Date(Date.UTC(2022, 1, 4));
  expect(createSiwsMessage({ ...message, issuedAt })).toMatchInlineSnapshot(`
    "example.com wants you to sign in with your Stacks account:
    SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173


    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2022-02-04T00:00:00.000Z"
  `);
});

test("parameters: expirationTime", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)));

  expect(
    createSiwsMessage({
      ...message,
      expirationTime: new Date(Date.UTC(2022, 1, 4)),
    }),
  ).toMatchInlineSnapshot(`
    "example.com wants you to sign in with your Stacks account:
    SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173


    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2023-02-01T00:00:00.000Z
    Expiration Time: 2022-02-04T00:00:00.000Z"
  `);

  vi.useRealTimers();
});

test("parameters: notBefore", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)));

  expect(
    createSiwsMessage({
      ...message,
      notBefore: new Date(Date.UTC(2022, 1, 4)),
    }),
  ).toMatchInlineSnapshot(`
    "example.com wants you to sign in with your Stacks account:
    SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173


    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2023-02-01T00:00:00.000Z
    Not Before: 2022-02-04T00:00:00.000Z"
  `);

  vi.useRealTimers();
});

test("parameters: requestId", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)));

  expect(
    createSiwsMessage({
      ...message,
      requestId: "123e4567-e89b-12d3-a456-426614174000",
    }),
  ).toMatchInlineSnapshot(`
    "example.com wants you to sign in with your Stacks account:
    SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173


    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2023-02-01T00:00:00.000Z
    Request ID: 123e4567-e89b-12d3-a456-426614174000"
  `);

  vi.useRealTimers();
});

test("parameters: resources", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)));

  expect(
    createSiwsMessage({
      ...message,
      resources: [
        "https://example.com/foo",
        "https://example.com/bar",
        "https://example.com/baz",
      ],
    }),
  ).toMatchInlineSnapshot(`
    "example.com wants you to sign in with your Stacks account:
    SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173


    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2023-02-01T00:00:00.000Z
    Resources:
    - https://example.com/foo
    - https://example.com/bar
    - https://example.com/baz"
  `);

  vi.useRealTimers();
});

test("behavior: invalid address", () => {
  expect(() =>
    createSiwsMessage({ ...message, address: "0xfoobarbaz" }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidAddressError: Address "0xfoobarbaz" is invalid.]
  `);
});

test("behavior: invalid chainId", () => {
  expect(() =>
    createSiwsMessage({ ...message, chainId: 1.1 }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiwsInvalidMessageFieldError: Invalid Sign-In with Stacks message field "chainId".
    - Chain ID must be a SIP-005 chain ID.
    - See https://github.com/stacksgov/sips/blob/main/sips/sip-005/sip-005-blocks-and-transactions.md
    Provided value: 1.1]
  `);
});

test("behavior: invalid domain", () => {
  expect(() =>
    createSiwsMessage({ ...message, domain: "#foo" }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiwsInvalidMessageFieldError: Invalid Sign-In with Stacks message field "domain".
    - Domain must be an RFC 3986 authority.
    - See https://www.rfc-editor.org/rfc/rfc3986
    Provided value: #foo]
  `);
});

test("behavior: invalid nonce", () => {
  expect(() =>
    createSiwsMessage({ ...message, nonce: "#foo" }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiwsInvalidMessageFieldError: Invalid Sign-In with Stacks message field "nonce".
    - Nonce must be at least 8 characters.
    - Nonce must be alphanumeric.
    Provided value: #foo]
  `);
});

test("behavior: invalid uri", () => {
  expect(() =>
    createSiwsMessage({ ...message, uri: "#foo" }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiwsInvalidMessageFieldError: Invalid Sign-In with Stacks message field "uri".
    - URI must be a RFC 3986 URI referring to the resource that is the subject of the signing.
    - See https://www.rfc-editor.org/rfc/rfc3986
    Provided value: #foo]
  `);
});

test("behavior: invalid version", () => {
  expect(() =>
    // @ts-expect-error
    createSiwsMessage({ ...message, version: "2" }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiwsInvalidMessageFieldError: Invalid Sign-In with Stacks message field "version".
    - Version must be '1'.
    Provided value: 2]
  `);
});

test("behavior: invalid scheme", () => {
  expect(() =>
    createSiwsMessage({ ...message, scheme: "foo_bar" }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiwsInvalidMessageFieldError: Invalid Sign-In with Stacks message field "scheme".
    - Scheme must be an RFC 3986 URI scheme.
    - See https://www.rfc-editor.org/rfc/rfc3986#section-3.1
    Provided value: foo_bar]
  `);
});

test("behavior: invalid statement", () => {
  expect(() =>
    createSiwsMessage({ ...message, statement: "foo\nbar" }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiwsInvalidMessageFieldError: Invalid Sign-In with Stacks message field "statement".
    - Statement must not include '\\n'.
    Provided value: foo
    bar]
  `);
});

test("behavior: invalid resources", () => {
  expect(() =>
    createSiwsMessage({
      ...message,
      resources: ["https://example.com", "foo"],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiwsInvalidMessageFieldError: Invalid Sign-In with Stacks message field "resources".
    - Every resource must be a RFC 3986 URI.
    - See https://www.rfc-editor.org/rfc/rfc3986
    Provided value: foo]
  `);
});

test.each([
  "example.com",
  "localhost",
  "127.0.0.1",
  "example.com:3000",
  "localhost:3000",
  "127.0.0.1:3000",
])("valid domain `%s`", (domain) => {
  expect(
    createSiwsMessage({
      ...message,
      domain,
    }),
  ).toBeTypeOf("string");
});

test.each([
  "http://example.com",
  "http://localhost",
  "http://127.0.0.1",
  "http://example.com:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "foobarbaz",
  "-example.com",
])("invalid domain `%s`", (domain) => {
  expect(() =>
    createSiwsMessage({
      ...message,
      domain,
    }),
  ).toThrowError();
});
