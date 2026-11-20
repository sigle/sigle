import type { OpenApi } from "effect/http-api";
import { Schema } from "effect";
import { allowedImageFormats } from "@/lib/images";

/**
 * Shared HTTP API error schemas.
 *
 * Every error carries a human readable `message` and is annotated with the HTTP
 * status code used by `HttpApiBuilder` when rendering the response and by the
 * OpenAPI generator. The status code identifies the error, so the JSON body
 * has no `_tag`, and each body schema is named for the OpenAPI components.
 */
export class BadRequest extends Schema.Error<
  BadRequest,
  { readonly brand: unique symbol }
>("sigle/api/BadRequest")(
  Schema.Struct({
    message: Schema.String,
  }).annotate({ identifier: "BadRequestError" }),
  {
    description: "Bad Request",
    httpApiStatus: 400,
  },
) {}

export class Unauthorized extends Schema.Error<
  Unauthorized,
  { readonly brand: unique symbol }
>("sigle/api/Unauthorized")(
  Schema.Struct({
    message: Schema.String,
  }).annotate({ identifier: "UnauthorizedError" }),
  {
    description: "Unauthorized",
    httpApiStatus: 401,
  },
) {}

export class Forbidden extends Schema.Error<
  Forbidden,
  { readonly brand: unique symbol }
>("sigle/api/Forbidden")(
  Schema.Struct({
    message: Schema.String,
  }).annotate({ identifier: "ForbiddenError" }),
  {
    description: "Forbidden",
    httpApiStatus: 403,
  },
) {}

export class NotFound extends Schema.Error<
  NotFound,
  { readonly brand: unique symbol }
>("sigle/api/NotFound")(
  Schema.Struct({
    message: Schema.String,
  }).annotate({ identifier: "NotFoundError" }),
  {
    description: "Not Found",
    httpApiStatus: 404,
  },
) {}

export class Conflict extends Schema.Error<
  Conflict,
  { readonly brand: unique symbol }
>("sigle/api/Conflict")(
  Schema.Struct({
    message: Schema.String,
  }).annotate({ identifier: "ConflictError" }),
  {
    description: "Conflict",
    httpApiStatus: 409,
  },
) {}

export class UnsupportedMediaType extends Schema.Error<
  UnsupportedMediaType,
  { readonly brand: unique symbol }
>("sigle/api/UnsupportedMediaType")(
  Schema.Struct({
    message: Schema.String,
  }).annotate({ identifier: "UnsupportedMediaTypeError" }),
  {
    description: "Unsupported Media Type",
    httpApiStatus: 415,
  },
) {}

export class PayloadTooLarge extends Schema.Error<
  PayloadTooLarge,
  { readonly brand: unique symbol }
>("sigle/api/PayloadTooLarge")(
  Schema.Struct({
    message: Schema.String,
  }).annotate({ identifier: "PayloadTooLargeError" }),
  {
    description: "Payload Too Large",
    httpApiStatus: 413,
  },
) {}

export class TooManyRequests extends Schema.Error<
  TooManyRequests,
  { readonly brand: unique symbol }
>("sigle/api/TooManyRequests")(
  Schema.Struct({
    message: Schema.String,
    retryAfterMillis: Schema.Finite,
  }).annotate({ identifier: "TooManyRequestsError" }),
  {
    description: "Too Many Requests",
    httpApiStatus: 429,
  },
) {}

export class InternalServerError extends Schema.Error<
  InternalServerError,
  { readonly brand: unique symbol }
>("sigle/api/InternalServerError")(
  Schema.Struct({
    message: Schema.String,
  }).annotate({ identifier: "InternalServerError" }),
  {
    description: "Internal Server Error",
    httpApiStatus: 500,
  },
) {}

/**
 * Date-time encoded as an ISO 8601 string.
 */
export const DateTime = Schema.DateTimeUtcFromString.pipe(
  Schema.annotateEncoded({ format: "date-time" }),
);

/**
 * Response of the draft and profile image uploads.
 */
export const UploadedImageResponse = Schema.Struct({
  url: Schema.String,
  // Size of the stored, optimized image.
  sizeBytes: Schema.Int,
  width: Schema.Int,
  height: Schema.Int,
  // Base64 ThumbHash placeholder for the optimized image.
  thumbhash: Schema.String,
}).annotate({ identifier: "UploadedImageResponse" });

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
