import { BaseError } from './base.js';

export type SiwsInvalidMessageFieldErrorType = SiwsInvalidMessageFieldError & {
  name: 'SiwsInvalidMessageFieldError';
};
export class SiwsInvalidMessageFieldError extends BaseError {
  constructor({
    field,
    metaMessages,
  }: {
    field: string;
    metaMessages?: string[] | undefined;
  }) {
    super(`Invalid Sign-In with Ethereum message field "${field}".`, {
      metaMessages,
      name: 'SiwsInvalidMessageFieldError',
    });
  }
}
