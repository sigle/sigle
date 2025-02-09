import { expect, test } from 'vitest';
import { parseSiwsMessage } from './parseSiwsMessage.js';

test('default', () => {
  const message = `example.com wants you to sign in with your Stacks account:
SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173

I accept the ExampleOrg Terms of Service: https://example.com/tos

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z`;
  const parsed = parseSiwsMessage(message);
  expect(parsed).toMatchInlineSnapshot(`
    {
      "address": "SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173",
      "chainId": 1,
      "domain": "example.com",
      "issuedAt": 2023-02-01T00:00:00.000Z,
      "nonce": "foobarbaz",
      "statement": "I accept the ExampleOrg Terms of Service: https://example.com/tos",
      "uri": "https://example.com/path",
      "version": "1",
    }
  `);
});

test('behavior: with scheme', () => {
  const message = `https://example.com wants you to sign in with your Stacks account:
SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z`;
  const parsed = parseSiwsMessage(message);
  expect(parsed.scheme).toMatchInlineSnapshot(`"https"`);
});

test('behavior: domain with port', () => {
  const message = `example.com:8080 wants you to sign in with your Stacks account:
SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z`;
  const parsed = parseSiwsMessage(message);
  expect(parsed.domain).toMatchInlineSnapshot(`"example.com:8080"`);
});

test('behavior: with statement', () => {
  const message = `example.com wants you to sign in with your Stacks account:
SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173

I accept the ExampleOrg Terms of Service: https://example.com/tos

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z`;
  const parsed = parseSiwsMessage(message);
  expect(parsed.statement).toMatchInlineSnapshot(
    `"I accept the ExampleOrg Terms of Service: https://example.com/tos"`,
  );
});

test('behavior: with expirationTime', () => {
  const message = `https://example.com wants you to sign in with your Stacks account:
SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Expiration Time: 2022-02-04T00:00:00.000Z`;
  const parsed = parseSiwsMessage(message);
  expect(parsed.expirationTime).toMatchInlineSnapshot(
    '2022-02-04T00:00:00.000Z',
  );
});

test('behavior: with notBefore', () => {
  const message = `https://example.com wants you to sign in with your Stacks account:
SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Not Before: 2022-02-04T00:00:00.000Z`;
  const parsed = parseSiwsMessage(message);
  expect(parsed.notBefore).toMatchInlineSnapshot('2022-02-04T00:00:00.000Z');
});

test('behavior: with requestId', () => {
  const message = `https://example.com wants you to sign in with your Stacks account:
SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Request ID: 123e4567-e89b-12d3-a456-426614174000`;
  const parsed = parseSiwsMessage(message);
  expect(parsed.requestId).toMatchInlineSnapshot(
    `"123e4567-e89b-12d3-a456-426614174000"`,
  );
});

test('behavior: with resources', () => {
  const message = `https://example.com wants you to sign in with your Stacks account:
SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Resources:
- https://example.com/foo
- https://example.com/bar
- https://example.com/baz`;
  const parsed = parseSiwsMessage(message);
  expect(parsed.resources).toMatchInlineSnapshot(`
    [
      "https://example.com/foo",
      "https://example.com/bar",
      "https://example.com/baz",
    ]
  `);
});

test('behavior: no suffix', () => {
  const message = `https://example.com wants you to sign in with your Stacks account:
SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173

`;
  const parsed = parseSiwsMessage(message);
  expect(parsed).toMatchInlineSnapshot(`
    {
      "address": "SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173",
      "domain": "example.com",
      "scheme": "https",
    }
  `);
});

test('behavior: no prefix', () => {
  const message = `URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Request ID: 123e4567-e89b-12d3-a456-426614174000`;
  const parsed = parseSiwsMessage(message);
  expect(parsed).toMatchInlineSnapshot(`
    {
      "chainId": 1,
      "issuedAt": 2023-02-01T00:00:00.000Z,
      "nonce": "foobarbaz",
      "requestId": "123e4567-e89b-12d3-a456-426614174000",
      "uri": "https://example.com/path",
      "version": "1",
    }
  `);
});

test('behavior: bogus message', () => {
  const message = 'foobarbaz';
  const parsed = parseSiwsMessage(message);
  expect(parsed).toMatchInlineSnapshot('{}');
});
