import { TaggedError } from "better-result";

export class OtsStampFailedError extends TaggedError("OtsStampFailedError")<{
  cause?: unknown;
  message: string;
}> {}

export class OtsUpgradeFailedError extends TaggedError(
  "OtsUpgradeFailedError",
)<{
  cause?: unknown;
  message: string;
}> {}

export class OtsParseError extends TaggedError("OtsParseError")<{
  cause?: unknown;
  message: string;
}> {}

export class OtsVerifyError extends TaggedError("OtsVerifyError")<{
  cause?: unknown;
  message: string;
}> {}
