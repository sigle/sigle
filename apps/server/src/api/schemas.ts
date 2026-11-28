import type { OpenApi } from "effect/http-api";
import { ErrorReporter, Schema } from "effect";
import { contentWarnings } from "@/db/schema";
import { allowedImageFormats } from "@/lib/images";

/**
 * Integer that is never negative, such as a count, a size, or a block height.
 */
export const NonNegativeInt = Schema.Int.check(
  Schema.isGreaterThanOrEqualTo(0),
);

/**
 * URI string annotated with OpenAPI `format: "uri"`.
 */
export const Uri = Schema.String.annotate({ format: "uri" });

const ErrorMessage = Schema.String.annotate({
  description: "Human-readable explanation of the error.",
});

const RetryAfterMillis = NonNegativeInt.annotate({
  description: "Milliseconds to wait before retrying the request.",
});

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
    message: ErrorMessage,
  }).annotate({
    identifier: "BadRequestError",
    description: "Invalid request parameters, headers, or payload.",
  }),
  {
    description: "Invalid request parameters, headers, or payload.",
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
    message: ErrorMessage,
  }).annotate({
    identifier: "UnauthorizedError",
    description: "Authentication is required or the session is invalid.",
  }),
  {
    description: "Authentication is required or the session is invalid.",
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
    message: ErrorMessage,
  }).annotate({
    identifier: "ForbiddenError",
    description: "Access denied or plan quota exceeded.",
  }),
  {
    description: "Access denied or plan quota exceeded.",
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
    message: ErrorMessage,
  }).annotate({
    identifier: "NotFoundError",
    description: "The requested resource does not exist or is not accessible.",
  }),
  {
    description: "The requested resource does not exist or is not accessible.",
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
    message: ErrorMessage,
  }).annotate({
    identifier: "ConflictError",
    description:
      "The request conflicts with the current state of the resource.",
  }),
  {
    description:
      "The request conflicts with the current state of the resource.",
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
    message: ErrorMessage,
  }).annotate({
    identifier: "UnsupportedMediaTypeError",
    description:
      "The Content-Type or detected file format is not a supported image type.",
  }),
  {
    description:
      "The Content-Type or detected file format is not a supported image type.",
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
    message: ErrorMessage,
  }).annotate({
    identifier: "PayloadTooLargeError",
    description:
      "The request body or image dimensions exceed the maximum allowed size.",
  }),
  {
    description:
      "The request body or image dimensions exceed the maximum allowed size.",
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
  "cache-control": Schema.String.annotate({
    description: "HTTP cache directive for public read responses.",
  }),
  etag: Schema.optionalKey(
    Schema.String.annotate({
      description:
        "Entity tag for the response. Send in `If-None-Match` to receive `304 Not Modified` while unchanged.",
    }),
  ),
};

export class TooManyRequests extends Schema.Error<
  TooManyRequests,
  { readonly brand: unique symbol }
>("sigle/api/TooManyRequests")(
  Schema.Struct({
    message: ErrorMessage,
    retryAfterMillis: RetryAfterMillis,
  }).annotate({
    identifier: "TooManyRequestsError",
    description: "Rate limit exceeded.",
  }),
  {
    description: "Rate limit exceeded.",
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
    message: ErrorMessage,
  }).annotate({
    identifier: "InternalServerError",
    description: "An unexpected server error occurred.",
  }),
  {
    description: "An unexpected server error occurred.",
    httpApiStatus: 500,
  },
) {}

/**
 * The server is too busy to handle the request now. It sets `Retry-After` to
 * `retryAfterMillis` rounded up to whole seconds.
 */
export class ServiceUnavailable extends Schema.Error<
  ServiceUnavailable,
  { readonly brand: unique symbol }
>("sigle/api/ServiceUnavailable")(
  Schema.Struct({
    message: ErrorMessage,
    retryAfterMillis: RetryAfterMillis,
  }).annotate({
    identifier: "ServiceUnavailableError",
    description:
      "The service is temporarily unavailable. Retry after the indicated delay.",
  }),
  {
    description:
      "The service is temporarily unavailable. Retry after the indicated delay.",
    httpApiStatus: 503,
  },
) {}

/**
 * Date-time encoded as an ISO 8601 string.
 */
export const DateTime = Schema.DateTimeUtcFromString.pipe(
  Schema.annotateEncoded({ format: "date-time" }),
);

/**
 * Content warning of a draft or post. Like every enum in the API it is
 * lowercase on the wire and decodes to the uppercase database value, which is
 * also the `contentWarning` of the signed post metadata.
 */
export const ContentWarning = Schema.Literals(["nsfw", "sensitive", "spoiler"])
  .transform(contentWarnings)
  .pipe(
    Schema.annotateEncoded({
      description: "Optional content warning label applied to a draft or post.",
    }),
  );

/**
 * Response of the draft and profile image uploads.
 */
export const UploadedImageResponse = Schema.Struct({
  url: Uri.annotate({
    description: "Public URL of the uploaded image.",
  }),
  sizeBytes: NonNegativeInt.annotate({
    description: "Size of the stored image, in bytes.",
  }),
  width: NonNegativeInt.annotate({
    description: "Width of the stored image, in pixels.",
  }),
  height: NonNegativeInt.annotate({
    description: "Height of the stored image, in pixels.",
  }),
  thumbhash: Schema.String.annotate({
    description:
      "Base64-encoded ThumbHash placeholder for progressive loading.",
  }),
}).annotate({
  identifier: "UploadedImageResponse",
  description: "Metadata of an uploaded image.",
});

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
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
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
            description: `Maximum number of items to return (1–${options.maxLimit}, default ${options.defaultLimit}).`,
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
            description: "Number of items to skip from the start of the list.",
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
export const imageRequestBody = (description: string) => ({
  description,
  required: true,
  content: Object.fromEntries(
    allowedImageFormats.map((contentType) => [
      contentType,
      { schema: { type: "string", format: "binary" } },
    ]),
  ),
});

const operationMethods: ReadonlyArray<OpenApi.OpenAPISpecMethodName> = [
  "get",
  "put",
  "post",
  "delete",
  "patch",
];

const COMPONENT_SCHEMA_PREFIX = "#/components/schemas/";

const isSchemaWithDescription = (
  value: unknown,
): value is { description?: string } =>
  typeof value === "object" &&
  value !== null &&
  "description" in value &&
  typeof value.description === "string";

const isSchemaWithRef = (value: unknown): value is { readonly $ref: string } =>
  typeof value === "object" &&
  value !== null &&
  "$ref" in value &&
  typeof value.$ref === "string";

const promoteDescription = (
  target: OpenApi.OpenAPISpecParameter | OpenApi.OpenAPISpecHeader,
  componentSchemas: OpenApi.OpenAPIComponents["schemas"],
): void => {
  if (target.description !== undefined) {
    return;
  }

  if (isSchemaWithDescription(target.schema)) {
    target.description = target.schema.description;
    delete target.schema.description;
    return;
  }

  if (
    isSchemaWithRef(target.schema) &&
    target.schema.$ref.startsWith(COMPONENT_SCHEMA_PREFIX)
  ) {
    const refTarget =
      componentSchemas[
        target.schema.$ref.slice(COMPONENT_SCHEMA_PREFIX.length)
      ];

    if (isSchemaWithDescription(refTarget)) {
      target.description = refTarget.description;
    }
  }
};

/**
 * API `OpenApi.Transform` that promotes `schema.description` to `description`
 * on parameters and response headers. Effect emits schema annotations inside
 * `parameter.schema` / `header.schema`, whereas OpenAPI UIs such as Scalar
 * display descriptions from the parameter and header objects directly. For
 * `$ref` parameter schemas (such as named enum parameters), it copies the
 * referenced component schema's description.
 */
export const promoteSchemaDescriptions: Parameters<
  typeof OpenApi.Transform.of
>[0] = (spec) => {
  // SAFETY: an API `OpenApi.Transform` is applied to the whole document.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const document = spec as OpenApi.OpenAPISpec;
  const componentSchemas = document.components.schemas;

  for (const pathItem of Object.values(document.paths)) {
    for (const method of operationMethods) {
      const operation = pathItem[method];

      if (operation === undefined) {
        continue;
      }

      for (const parameter of operation.parameters) {
        promoteDescription(parameter, componentSchemas);
      }

      for (const response of Object.values(operation.responses)) {
        for (const header of Object.values(response.headers ?? {})) {
          promoteDescription(header, componentSchemas);
        }
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
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const document = spec as OpenApi.OpenAPISpec;

  for (const pathItem of Object.values(document.paths)) {
    for (const method of operationMethods) {
      const operation = pathItem[method];

      if (
        operation !== undefined &&
        operation.parameters.length === 0 &&
        operation.requestBody === undefined
      ) {
        delete operation.responses[400];
      }
    }
  }

  return document;
};

/**
 * Endpoint `OpenApi.Transform` removing the inherited `400` response on routes
 * whose only input is an unconstrained string path parameter and whose handler
 * never returns `BadRequest`.
 */
export const omitBadRequest: Parameters<typeof OpenApi.Transform.of>[0] = (
  spec,
) => {
  // SAFETY: an endpoint `OpenApi.Transform` is applied to the operation
  // object generated for that endpoint.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const operation = spec as OpenApi.OpenAPISpecOperation;
  delete operation.responses[400];
  return operation;
};

/**
 * Endpoint `OpenApi.Transform` setting an action-specific description on a
 * response status without altering the shared component schema.
 */
export const describeResponse =
  (
    status: number,
    description: string,
  ): Parameters<typeof OpenApi.Transform.of>[0] =>
  (spec) => {
    // SAFETY: an endpoint `OpenApi.Transform` is applied to the operation
    // object generated for that endpoint.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const operation = spec as OpenApi.OpenAPISpecOperation;
    const response = operation.responses[status];

    if (response === undefined) {
      return operation;
    }

    return {
      ...operation,
      responses: {
        ...operation.responses,
        [status]: { ...response, description },
      },
    };
  };

/**
 * API `OpenApi.Transform` adding OpenAPI `info.contact` metadata.
 */
export const withApiContact =
  (contact: {
    readonly name: string;
    readonly url: string;
  }): Parameters<typeof OpenApi.Transform.of>[0] =>
  (spec) => {
    // SAFETY: an API `OpenApi.Transform` is applied to the whole document.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const document = spec as OpenApi.OpenAPISpec;

    return {
      ...document,
      info: {
        ...document.info,
        contact,
      },
    };
  };
