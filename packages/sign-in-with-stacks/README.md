# sign-in-with-stacks

Sign-in with Stacks is a library for creating and verifying Sign-In with Stacks messages.

The first version of this library is a port of the view siwe implementation.

## Installation

```
npm install sign-in-with-stacks
```

## Usage

On the client create a message and sign it with the user's wallet.

```ts
import { createSiwsMessage, generateSiwsNonce } from 'sign-in-with-stacks'
import { STACKS_MAINNET } from '@stacks/network';
import { openSignatureRequestPopup } from '@stacks/connect';

const message = createSiwsMessage({
  address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  chainId: STACKS_MAINNET.chainId,
  domain: 'example.com',
  nonce: generateSiwsNonce(),
  uri: 'https://example.com/path',
  version: '1',
});

await openSignatureRequestPopup({
  message,
  onFinish: async ({ signature }) => {
    // Pass the signature to your backend
  },
});
```

On the backend verify the signature, can be used with any framework, next-auth, express, etc.

```ts
import { verifySiwsMessage } from 'sign-in-with-stacks'
import { STACKS_MAINNET } from '@stacks/network';

const valid = verifySiwsMessage({
  message,
  signature,
  nonce: 'your-nonce',
})
```
