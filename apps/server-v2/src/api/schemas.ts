import { Schema } from "effect";

/**
 * Shared HTTP API error schemas.
 *
 * Every error carries a human readable `message` and is annotated with the HTTP
 * status code used by `HttpApiBuilder` when rendering the response and by the
 * OpenAPI generator.
 */
export class BadRequest extends Schema.Error<BadRequest>(
  "sigle/api/BadRequest",
)(
  {
    _tag: Schema.tag("BadRequest"),
    message: Schema.String,
  },
  {
    description: "Bad Request",
    httpApiStatus: 400,
  },
) {}

export class Unauthorized extends Schema.Error<Unauthorized>(
  "sigle/api/Unauthorized",
)(
  {
    _tag: Schema.tag("Unauthorized"),
    message: Schema.String,
  },
  {
    description: "Unauthorized",
    httpApiStatus: 401,
  },
) {}

export class Forbidden extends Schema.Error<Forbidden>("sigle/api/Forbidden")(
  {
    _tag: Schema.tag("Forbidden"),
    message: Schema.String,
  },
  {
    description: "Forbidden",
    httpApiStatus: 403,
  },
) {}

export class NotFound extends Schema.Error<NotFound>("sigle/api/NotFound")(
  {
    _tag: Schema.tag("NotFound"),
    message: Schema.String,
  },
  {
    description: "Not Found",
    httpApiStatus: 404,
  },
) {}

export class TooManyRequests extends Schema.Error<TooManyRequests>(
  "sigle/api/TooManyRequests",
)(
  {
    _tag: Schema.tag("TooManyRequests"),
    message: Schema.String,
    retryAfterMillis: Schema.Number,
  },
  {
    description: "Too Many Requests",
    httpApiStatus: 429,
  },
) {}

export class InternalServerError extends Schema.Error<InternalServerError>(
  "sigle/api/InternalServerError",
)(
  {
    _tag: Schema.tag("InternalServerError"),
    message: Schema.String,
  },
  {
    description: "Internal Server Error",
    httpApiStatus: 500,
  },
) {}
