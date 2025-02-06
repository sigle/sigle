const size = 256;
let index = size;
let buffer: string;

function uid(length = 11) {
  if (!buffer || index + length > size * 2) {
    buffer = '';
    index = 0;
    for (let i = 0; i < size; i++) {
      buffer += ((256 + Math.random() * 256) | 0).toString(16).substring(1);
    }
  }
  return buffer.substring(index, index++ + length);
}

/**
 * @description Generates random EIP-4361 nonce.
 *
 * @example
 * const nonce = generateNonce()
 *
 * @see https://eips.ethereum.org/EIPS/eip-4361
 *
 * @returns A randomly generated EIP-4361 nonce.
 */
export function generateSiwsNonce(): string {
  return uid(96);
}
