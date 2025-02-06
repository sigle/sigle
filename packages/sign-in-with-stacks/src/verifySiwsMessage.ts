import { hashMessage, verifyMessageSignatureRsv } from '@stacks/encryption';
import {
  createMessageSignature,
  publicKeyFromSignatureRsv,
} from '@stacks/transactions';
import { parseSiwsMessage } from './parseSiwsMessage.js';
import {
  type ValidateSiwsMessageParameters,
  validateSiwsMessage,
} from './validateSiwsMessage.js';
import { Prettify } from './types.js';

export type VerifySiwsMessageParameters = Prettify<
  Pick<
    ValidateSiwsMessageParameters,
    'address' | 'domain' | 'nonce' | 'scheme' | 'time'
  > & {
    /**
     * SIP-X formatted message.
     */
    message: string;
    /**
     * Signature to check against.
     */
    signature: string;
  }
>;

export type VerifySiwsMessageReturnType = boolean;

/**
 * Verifies [SIP-X](https://github.com/stacksgov/sips/pull/70) formatted message was signed.
 *
 * @param parameters - {@link VerifySiwsMessageParameters}
 * @returns Whether or not the signature is valid. {@link VerifySiwsMessageReturnType}
 */
export function verifySiwsMessage(
  parameters: VerifySiwsMessageParameters,
): VerifySiwsMessageReturnType {
  const {
    address,
    domain,
    message,
    nonce,
    scheme,
    signature,
    time = new Date(),
  } = parameters;

  const parsed = parseSiwsMessage(message);
  if (!parsed.address) return false;

  const isValid = validateSiwsMessage({
    address,
    domain,
    message: parsed,
    nonce,
    scheme,
    time,
  });
  if (!isValid) return false;

  const stacksSignature = createMessageSignature(signature);
  const hash = hashMessage(message);
  const hashedMessage = Buffer.from(hash).toString('hex');
  const publicKey = publicKeyFromSignatureRsv(
    hashedMessage,
    stacksSignature.data,
  );

  return verifyMessageSignatureRsv({
    signature,
    message,
    publicKey,
  });
}
