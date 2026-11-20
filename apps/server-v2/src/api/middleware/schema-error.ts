import { Effect, SchemaIssue } from "effect";
import { HttpApiMiddleware } from "effect/http-api";
import { BadRequest } from "@/api/schemas";

/**
 * Renders request decoding failures (params, headers, query, payload) as a
 * `BadRequest` whose message lists the schema issues, such as
 * "Invalid request query: limit: Expected a value greater than or equal to 1".
 * Without it, Effect responds with an empty 400 body. Response encoding
 * failures keep Effect's default handling: an empty 500 that is reported.
 */
export class SchemaErrorMiddleware extends HttpApiMiddleware.Service<SchemaErrorMiddleware>()(
  "sigle/SchemaErrorMiddleware",
  { error: BadRequest },
) {}

const formatIssues = SchemaIssue.makeFormatterStandardSchemaV1();

const formatIssue = (issue: {
  readonly message: string;
  readonly path?: ReadonlyArray<unknown>;
}) =>
  // Effect's formatter only emits property key path segments.
  issue.path?.length
    ? `${issue.path.map(String).join(".")}: ${issue.message}`
    : issue.message;

export const SchemaErrorMiddlewareLayer =
  HttpApiMiddleware.layerSchemaErrorTransform(
    SchemaErrorMiddleware,
    (error) => {
      if (error.kind === "Body" || error.kind === "ResponseHeaders") {
        return Effect.fail(error);
      }

      const issues = formatIssues(error.cause.issue).issues.map(formatIssue);

      return Effect.fail(
        new BadRequest({
          message: `Invalid request ${error.kind.toLowerCase()}: ${issues.join("; ")}`,
        }),
      );
    },
  );
