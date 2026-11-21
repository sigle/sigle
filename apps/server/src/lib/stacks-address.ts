import {
  addressToString,
  createAddress,
  validateStacksAddress,
} from "@stacks/transactions";
import { Effect } from "effect";
import { BadRequest } from "@/api/schemas";

/**
 * Canonical c32 form of a Stacks address read from a request, the form wallet
 * and profile addresses are stored in. Validation accepts spellings that
 * decoding folds, such as `O` for `0`, so lookups must use this form.
 */
export const parseStacksAddress = (value: string) =>
  validateStacksAddress(value)
    ? Effect.succeed(addressToString(createAddress(value)))
    : Effect.fail(new BadRequest({ message: "Invalid Stacks address" }));
