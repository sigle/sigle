import { validateStacksAddress } from '@stacks/transactions';
import type { SiwsMessage, ExactPartial } from './types.js';
import { InvalidAddressError } from './errors/address.js';

export type ValidateSiwsMessageParameters = {
  /**
   * Stacks address to check against.
   */
  address?: string | undefined;
  /**
   * [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986) authority to check against.
   */
  domain?: string | undefined;
  /**
   * SIP-X message fields.
   */
  message: ExactPartial<SiwsMessage>;
  /**
   * Random string to check against.
   */
  nonce?: string | undefined;
  /**
   * [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986#section-3.1) URI scheme to check against.
   */
  scheme?: string | undefined;
  /**
   * Current time to check optional `expirationTime` and `notBefore` fields.
   *
   * @default new Date()
   */
  time?: Date | undefined;
};

export type ValidateSiwsMessageReturnType = boolean;

/**
 * @description Validates SIP-X message.
 *
 * @see https://github.com/stacksgov/sips/pull/70
 */
export function validateSiwsMessage(
  parameters: ValidateSiwsMessageParameters,
): ValidateSiwsMessageReturnType {
  const {
    address,
    domain,
    message,
    nonce,
    scheme,
    time = new Date(),
  } = parameters;

  if (domain && message.domain !== domain) return false;
  if (nonce && message.nonce !== nonce) return false;
  if (scheme && message.scheme !== scheme) return false;

  if (message.expirationTime && time >= message.expirationTime) return false;
  if (message.notBefore && time < message.notBefore) return false;

  try {
    if (!message.address) return false;
    if (address && !isAddressEqual(message.address, address)) return false;
  } catch {
    return false;
  }

  return true;
}

function isAddressEqual(a: string, b: string): boolean {
  if (!validateStacksAddress(a)) throw new InvalidAddressError({ address: a });
  if (!validateStacksAddress(b)) throw new InvalidAddressError({ address: b });
  return a === b;
}
