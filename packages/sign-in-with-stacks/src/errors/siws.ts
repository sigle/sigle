import { BaseError } from './base.js';

export type SiwsInvalidMessageFieldErrorType = SiwsInvalidMessageFieldError & {
  name: 'SiwsInvalidMessageFieldError';
};
export class SiwsInvalidMessageFieldError extends BaseError {
  constructor({ field }: { field: string }) {
    super(`Invalid Sign-In with Ethereum message field "${field}".`, {
      name: 'SiwsInvalidMessageFieldError',
    });
  }
}
