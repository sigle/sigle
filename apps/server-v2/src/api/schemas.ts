import type { OpenApi } from "effect/http-api";
import { Schema } from "effect";
import { allowedImageFormats } from "@/lib/images";

/**
 * Shared HTTP API error schemas.
 *
 * Every error carries a human readable `message` and is annotated with the HTTP
 * status code used by `HttpApiBuilder` when rendering the response and by the
 * OpenAPI generator.
 */
export class BadRequest extends Schema.Error<
  BadRequest,
  { readonly brand: unique symbol }
>("sigle/api/BadRequest")(
  {
    _tag: Schema.tag("BadRequest"),
    message: Schema.String,
  },
  {
    description: "Bad Request",
    httpApiStatus: 400,
  },
) {}

export class Unauthorized extends Schema.Error<
  Unauthorized,
  { readonly brand: unique symbol }
>("sigle/api/Unauthorized")(
  {
    _tag: Schema.tag("Unauthorized"),
    message: Schema.String,
  },
  {
    description: "Unauthorized",
    httpApiStatus: 401,
  },
) {}

export class Forbidden extends Schema.Error<
  Forbidden,
  { readonly brand: unique symbol }
>("sigle/api/Forbidden")(
  {
    _tag: Schema.tag("Forbidden"),
    message: Schema.String,
  },
  {
    description: "Forbidden",
    httpApiStatus: 403,
  },
) {}

export class NotFound extends Schema.Error<
  NotFound,
  { readonly brand: unique symbol }
>("sigle/api/NotFound")(
  {
    _tag: Schema.tag("NotFound"),
    message: Schema.String,
  },
  {
    description: "Not Found",
    httpApiStatus: 404,
  },
) {}

export class Conflict extends Schema.Error<
  Conflict,
  { readonly brand: unique symbol }
>("sigle/api/Conflict")(
  {
    _tag: Schema.tag("Conflict"),
    message: Schema.String,
  },
  {
    description: "Conflict",
    httpApiStatus: 409,
  },
) {}

export class UnsupportedMediaType extends Schema.Error<
  UnsupportedMediaType,
  { readonly brand: unique symbol }
>("sigle/api/UnsupportedMediaType")(
  {
    _tag: Schema.tag("UnsupportedMediaType"),
    message: Schema.String,
  },
  {
    description: "Unsupported Media Type",
    httpApiStatus: 415,
  },
) {}

export class PayloadTooLarge extends Schema.Error<
  PayloadTooLarge,
  { readonly brand: unique symbol }
>("sigle/api/PayloadTooLarge")(
  {
    _tag: Schema.tag("PayloadTooLarge"),
    message: Schema.String,
  },
  {
    description: "Payload Too Large",
    httpApiStatus: 413,
  },
) {}

export class TooManyRequests extends Schema.Error<
  TooManyRequests,
  { readonly brand: unique symbol }
>("sigle/api/TooManyRequests")(
  {
    _tag: Schema.tag("TooManyRequests"),
    message: Schema.String,
    retryAfterMillis: Schema.Finite,
  },
  {
    description: "Too Many Requests",
    httpApiStatus: 429,
  },
) {}

export class InternalServerError extends Schema.Error<
  InternalServerError,
  { readonly brand: unique symbol }
>("sigle/api/InternalServerError")(
  {
    _tag: Schema.tag("InternalServerError"),
    message: Schema.String,
  },
  {
    description: "Internal Server Error",
    httpApiStatus: 500,
  },
) {}

/**
 * `limit` and `offset` query fields shared by the paginated list endpoints.
 */
export const paginationQueryFields = (maxLimit: number) => ({
  limit: Schema.optionalKey(
    Schema.Int.pipe(
      Schema.check(
        Schema.isGreaterThanOrEqualTo(1),
        Schema.isLessThanOrEqualTo(maxLimit),
      ),
    ),
  ),
  offset: Schema.optionalKey(
    Schema.Int.pipe(Schema.check(Schema.isGreaterThanOrEqualTo(0))),
  ),
});

/**
 * Query values are decoded from their string form, so the generated OpenAPI
 * documents `limit` and `offset` as strings. Document them as integers instead
 * so the generated SDK accepts numbers.
 */
export const documentPaginationQuery =
  (maxLimit: number): Parameters<typeof OpenApi.Transform.of>[0] =>
  (spec) => {
    // SAFETY: an endpoint `OpenApi.Transform` is applied to the operation
    // object generated for that endpoint.
    const operation = spec as OpenApi.OpenAPISpecOperation;

    return {
      ...operation,
      parameters: operation.parameters.map((parameter) => {
        if (parameter.in !== "query") {
          return parameter;
        }

        if (parameter.name === "limit") {
          return {
            ...parameter,
            schema: { type: "integer", minimum: 1, maximum: maxLimit },
          };
        }

        if (parameter.name === "offset") {
          return { ...parameter, schema: { type: "integer", minimum: 0 } };
        }

        return parameter;
      }),
    };
  };

/**
 * Image upload endpoints read the raw request body themselves (see
 * `uploadImageFromRequest`), so the binary request body is documented manually
 * in the OpenAPI specification.
 */
export const imageRequestBody = {
  required: true,
  content: Object.fromEntries(
    allowedImageFormats.map((contentType) => [
      contentType,
      { schema: { type: "string", format: "binary" } },
    ]),
  ),
};
