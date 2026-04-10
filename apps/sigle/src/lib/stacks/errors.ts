import { TaggedError } from "better-result";

export class StacksApiError extends TaggedError("StacksApiError")<{
  cause: unknown;
  message: string;
}>() {
  constructor(params: { cause: unknown }) {
    const { cause } = params;
    let causeText: string | undefined = undefined;
    if (typeof cause === "string") {
      causeText = cause;
    } else if (cause instanceof Error) {
      causeText = cause.message;
    } else if (cause !== null) {
      try {
        causeText = JSON.stringify(cause);
      } catch {
        causeText = String(cause);
      }
    }
    const message = `Stacks API error ${causeText ? `: ${causeText}` : ""}`;
    super({ cause, message });
  }
}

export class TransactionTimeoutError extends TaggedError(
  "TransactionTimeoutError",
)<{
  txId: string;
  message: string;
}>() {}
