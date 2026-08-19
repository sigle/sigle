import { InvalidSignatureError } from "@sigle/sdk";
import { TaggedError } from "better-result";

export { InvalidSignatureError };

export class MetadataFetchFailedError extends TaggedError(
  "MetadataFetchFailedError",
)<{
  error: string;
}> {}

export class InvalidMetadataError extends TaggedError("InvalidMetadataError")<{
  error: string;
}> {}
