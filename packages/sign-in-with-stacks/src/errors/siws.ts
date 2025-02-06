export class SiwsInvalidMessageFieldError extends Error {
  name = 'SiwsInvalidMessageFieldError';

  constructor({ field }: { field: string }) {
    super(`Invalid Sign-In with Ethereum message field "${field}".`);
  }
}
