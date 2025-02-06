import { expect, test } from 'vitest';
import { STACKS_MAINNET } from '@stacks/network';
import { createSiwsMessage } from './createSiwsMessage.js';
import { verifySiwsMessage } from './verifySiwsMessage.js';
import { accounts } from '../test/constants.js';
import { signMessageHashRsv } from '@stacks/transactions';

const account = accounts[0];

test('default', async () => {
  const message = createSiwsMessage({
    address: account.address,
    chainId: STACKS_MAINNET.chainId,
    domain: 'example.com',
    nonce: 'foobarbaz',
    uri: 'https://example.com/path',
    version: '1',
  });

  const signature = signMessageHashRsv({
    messageHash: Buffer.from(message).toString('hex'),
    privateKey: account.privateKey,
  });

  expect(
    await verifySiwsMessage({
      message,
      signature,
    }),
  ).toBeTruthy();
});

test('behavior: invalid message fields', async () => {
  const message = createSiwsMessage({
    address: account.address,
    chainId: STACKS_MAINNET.chainId,
    domain: 'example.com',
    nonce: 'foobarbaz',
    uri: 'https://example.com/path',
    version: '1',
  });
  const signature = signMessageHashRsv({
    messageHash: Buffer.from(message).toString('hex'),
    privateKey: account.privateKey,
  });
  expect(
    await verifySiwsMessage({
      domain: 'viem.sh',
      message,
      signature,
    }),
  ).toBeFalsy();
});

test('behavior: invalid message', async () => {
  const message = 'foobarbaz';
  const signature = signMessageHashRsv({
    messageHash: Buffer.from(message).toString('hex'),
    privateKey: account.privateKey,
  });
  expect(
    await verifySiwsMessage({
      message,
      signature,
    }),
  ).toBeFalsy();
});
