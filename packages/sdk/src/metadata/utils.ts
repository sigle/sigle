import type { z } from "zod";
import { fromError } from "zod-validation-error";

/**
 * An error that occurs when an object does not match the expected shape.
 */
export class ValidationError extends Error {
  name = "ValidationError" as const;
}

export function evaluate<Input, Output>(
  result: z.SafeParseReturnType<Input, Output>,
): Output {
  if (result.success) {
    return result.data;
  }
  throw new ValidationError(fromError(result.error).toString());
}
