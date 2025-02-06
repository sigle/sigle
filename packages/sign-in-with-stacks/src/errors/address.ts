export class InvalidAddressError extends Error {
  name = 'InvalidAddressError';

  constructor({ address }: { address: string }) {
    super(`Address "${address}" is invalid.`);
  }
}
