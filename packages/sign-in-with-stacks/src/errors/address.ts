import { BaseError } from "./base.js";

export type InvalidAddressErrorType = InvalidAddressError & {
  name: "InvalidAddressError";
};
export class InvalidAddressError extends BaseError {
  constructor({ address }: { address: string }) {
    super(`Address "${address}" is invalid.`, {
      name: "InvalidAddressError",
    });
  }
}
