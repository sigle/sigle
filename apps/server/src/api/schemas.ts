import type { OpenApi } from "effect/http-api";
import { ErrorReporter, Schema } from "effect";
import { allowedImageFormats } from "@/lib/images";

/**
 * Integer that is never negative, such as a count, a size, or a block height.
 */
export const NonNegativeInt = Schema.Int.check(
  Schema.isGreaterThanOrEqualTo(0),
);

/**
 * Shared HTTP API error schemas.
 *
 * Every error carries a human readable `message` and is annotated with the HTTP
 * status code used by `HttpApiBuilder` when rendering the response and by the
 * OpenAPI generator. The status code identifies the error, so the JSON body
 * has no `_tag`, and each body schema is named for the OpenAPI components.
 *
 * The 4xx errors are expected client errors: they are marked ignored so the
 * error reporters, PostHog included, skip them, like Effect's own
 * `HttpApiError`s.
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
) {
  readonly [ErrorReporter.ignore] = true;
}

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
) {
  readonly [ErrorReporter.ignore] = true;
}

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
) {
  readonly [ErrorReporter.ignore] = true;
}

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
) {
  readonly [ErrorReporter.ignore] = true;
}

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
) {
  readonly [ErrorReporter.ignore] = true;
}

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
) {
  readonly [ErrorReporter.ignore] = true;
}

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
) {
  readonly [ErrorReporter.ignore] = true;
}

/**
 * URL filter accepting only the given protocols, such as `"https:"`.
 */
export const isUrlWithProtocol = (
  protocols: ReadonlyArray<string>,
  expected: string,
) =>
  Schema.makeFilter((value: string) =>
    URL.canParse(value) && protocols.includes(new URL(value).protocol)
      ? true
      : `Expected ${expected}`,
  );

/**
 * Headers of publicly cacheable reads, set to `PUBLIC_CACHE_CONTROL`. The
 * ETag is added by `EtagLayer` after the handler, so it is optional here: the
 * handlers don't set it, and it is listed for the OpenAPI document.
 */
export const PublicCacheHeaders = {
  "cache-control": Schema.String,
  etag: Schema.optionalKey(
    Schema.String.annotate({
      description:
        "Hash of the body, send it back in `If-None-Match` to get a 304 while the resource is unchanged.",
    }),
  ),
};

export class TooManyRequests extends Schema.Error<
  TooManyRequests,
  { readonly brand: unique symbol }
>("sigle/api/TooManyRequests")(
  Schema.Struct({
    message: Schema.String,
    retryAfterMillis: NonNegativeInt,
  }).annotate({ identifier: "TooManyRequestsError" }),
  {
    description: "Too Many Requests",
    httpApiStatus: 429,
  },
) {
  readonly [ErrorReporter.ignore] = true;
}

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
  sizeBytes: NonNegativeInt,
  width: NonNegativeInt,
  height: NonNegativeInt,
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
  offset: Schema.optionalKey(NonNegativeInt),
});

/**
 * Query values are decoded from their string form, so the generated OpenAPI
 * documents `limit` and `offset` as strings. Document them as integers instead
 * so the generated SDK accepts numbers, with the defaults the handler applies.
 */
export const documentPaginationQuery =
  (options: {
    readonly maxLimit: number;
    readonly defaultLimit: number;
  }): Parameters<typeof OpenApi.Transform.of>[0] =>
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
            description: "Number of results to return.",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: options.maxLimit,
              default: options.defaultLimit,
            },
          };
        }

        if (parameter.name === "offset") {
          return {
            ...parameter,
            description: "Number of results to skip.",
            schema: { type: "integer", minimum: 0, default: 0 },
          };
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

/**
 * Description of each path and query parameter, by name. Parameters with the
 * same name mean the same thing on every endpoint.
 */
const parameterDescriptions: ReadonlyMap<string, string> = new Map([
  ["address", "Stacks address of the user."],
  ["author", "Only list the posts of this Stacks address."],
  ["draftId", "ID of the draft."],
  ["postId", "ID of the post, its Arweave transaction ID."],
  ["kind", "Which profile image to replace."],
  ["queueName", "Name of the job queue."],
  ["jobId", "ID of the failed job."],
]);

const operationMethods: ReadonlyArray<OpenApi.OpenAPISpecMethodName> = [
  "get",
  "put",
  "post",
  "delete",
  "patch",
];

/**
 * API `OpenApi.Transform` adding the descriptions of
 * {@link parameterDescriptions} to the parameters that have none.
 */
export const documentParameters: Parameters<typeof OpenApi.Transform.of>[0] = (
  spec,
) => {
  // SAFETY: an API `OpenApi.Transform` is applied to the whole document.
  const document = spec as OpenApi.OpenAPISpec;

  for (const pathItem of Object.values(document.paths)) {
    for (const method of operationMethods) {
      for (const parameter of pathItem[method]?.parameters ?? []) {
        parameter.description ??= parameterDescriptions.get(parameter.name);
      }
    }
  }

  return document;
};

/**
 * API `OpenApi.Transform` removing the 400 response of operations without path
 * parameters, query, headers, or body. `SchemaErrorMiddleware` is attached to
 * the whole API, so every operation documents its `BadRequest`, but a request
 * without inputs has nothing to decode. No such operation fails with
 * `BadRequest` on its own.
 */
export const omitBadRequestWithoutInputs: Parameters<
  typeof OpenApi.Transform.of
>[0] = (spec) => {
  // SAFETY: an API `OpenApi.Transform` is applied to the whole document.
  const document = spec as OpenApi.OpenAPISpec;

  for (const pathItem of Object.values(document.paths)) {
    for (const method of operationMethods) {
      const operation = pathItem[method];

      if (
        operation !== undefined &&
        operation.parameters.length === 0 &&
        operation.requestBody === undefined
      ) {
        delete operation.responses["400"];
      }
    }
  }

  return document;
};
