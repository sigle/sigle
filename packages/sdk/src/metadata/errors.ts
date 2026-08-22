import { TaggedError } from "better-result";

export class InvalidSignatureError extends TaggedError(
  "InvalidSignatureError",
)<{
  error: string;
  message: string;
  cause?: unknown;
}> {
  constructor(args: { error: string; cause?: unknown }) {
    super({
      error: args.error,
      message: args.error,
      cause: args.cause,
    });
  }
}
