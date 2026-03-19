import { TaggedError } from "better-result";

export class MetadataFetchFailedError extends TaggedError(
  "MetadataFetchFailedError",
)<{
  error: string;
}>() {}

export class InvalidMetadataError extends TaggedError("InvalidMetadataError")<{
  error: string;
}>() {}
