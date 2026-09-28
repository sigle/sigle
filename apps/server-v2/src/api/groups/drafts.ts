import { Schema } from "effect";
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  OpenApi,
} from "effect/unstable/httpapi";
import { UserAuthMiddleware } from "@/api/middleware/auth-user";
import { NotFound } from "@/api/schemas";

export const DRAFT_LIST_DEFAULT_LIMIT = 20;
export const DRAFT_LIST_MAX_LIMIT = 100;

const DateTime = Schema.DateTimeUtcFromString.pipe(
  Schema.annotateEncoded({ format: "date-time" }),
);

export const Draft = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  content: Schema.String,
  metaTitle: Schema.NullOr(Schema.String),
  metaDescription: Schema.NullOr(Schema.String),
  coverImage: Schema.NullOr(Schema.String),
  tags: Schema.Array(Schema.String),
  canonicalUri: Schema.NullOr(Schema.String),
  createdAt: DateTime,
  updatedAt: DateTime,
}).annotate({ identifier: "Draft" });

export const DraftListItem = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  metaTitle: Schema.NullOr(Schema.String),
  metaDescription: Schema.NullOr(Schema.String),
  coverImage: Schema.NullOr(Schema.String),
  tags: Schema.Array(Schema.String),
  canonicalUri: Schema.NullOr(Schema.String),
  createdAt: DateTime,
  updatedAt: DateTime,
}).annotate({ identifier: "DraftListItem" });

export const DraftListResponse = Schema.Struct({
  results: Schema.Array(DraftListItem),
  limit: Schema.Int,
  offset: Schema.Int,
  total: Schema.Int,
}).annotate({ identifier: "DraftListResponse" });

export const DraftListQuery = Schema.Struct({
  limit: Schema.optionalKey(
    Schema.FiniteFromString.pipe(
      Schema.check(
        Schema.isGreaterThanOrEqualTo(1),
        Schema.isLessThanOrEqualTo(DRAFT_LIST_MAX_LIMIT),
      ),
    ),
  ),
  offset: Schema.optionalKey(
    Schema.FiniteFromString.pipe(
      Schema.check(Schema.isGreaterThanOrEqualTo(0)),
    ),
  ),
}).annotate({ identifier: "DraftListQuery" });

export const CreateDraftPayload = Schema.Struct({
  title: Schema.optionalKey(Schema.String),
  content: Schema.optionalKey(Schema.String),
  metaTitle: Schema.optionalKey(Schema.NullOr(Schema.String)),
  metaDescription: Schema.optionalKey(Schema.NullOr(Schema.String)),
  coverImage: Schema.optionalKey(Schema.NullOr(Schema.String)),
  tags: Schema.optionalKey(Schema.Array(Schema.String)),
  canonicalUri: Schema.optionalKey(Schema.NullOr(Schema.String)),
}).annotate({ identifier: "CreateDraftPayload" });

export const UpdateDraftPayload = Schema.Struct({
  title: Schema.optionalKey(Schema.String),
  content: Schema.optionalKey(Schema.String),
  metaTitle: Schema.optionalKey(Schema.NullOr(Schema.String)),
  metaDescription: Schema.optionalKey(Schema.NullOr(Schema.String)),
  coverImage: Schema.optionalKey(Schema.NullOr(Schema.String)),
  tags: Schema.optionalKey(Schema.Array(Schema.String)),
  canonicalUri: Schema.optionalKey(Schema.NullOr(Schema.String)),
}).annotate({ identifier: "UpdateDraftPayload" });

export const DraftsGroup = HttpApiGroup.make("drafts")
  .add(
    HttpApiEndpoint.post("create", "/", {
      payload: CreateDraftPayload,
      success: HttpApiSchema.WithHeaders(HttpApiSchema.status(201)(Draft), {
        location: Schema.String,
      }),
    })
      .annotate(OpenApi.Summary, "Create a draft")
      .annotate(
        OpenApi.Description,
        "Create a new draft, optionally seeded with the provided fields.",
      ),
    HttpApiEndpoint.get("list", "/", {
      query: DraftListQuery,
      success: DraftListResponse,
    })
      .annotate(OpenApi.Summary, "List drafts")
      .annotate(
        OpenApi.Description,
        "List the current user drafts, most recently updated first.",
      ),
    HttpApiEndpoint.get("get", "/:draftId", {
      params: {
        draftId: Schema.String,
      },
      success: Draft,
      error: NotFound,
    }).annotate(OpenApi.Summary, "Get a draft"),
    HttpApiEndpoint.patch("update", "/:draftId", {
      params: {
        draftId: Schema.String,
      },
      payload: UpdateDraftPayload,
      success: Draft,
      error: NotFound,
    })
      .annotate(OpenApi.Summary, "Update a draft")
      .annotate(
        OpenApi.Description,
        "Partially update a draft. Omitted fields are left unchanged, `null` clears nullable fields.",
      ),
    HttpApiEndpoint.delete("delete", "/:draftId", {
      params: {
        draftId: Schema.String,
      },
      success: HttpApiSchema.NoContent,
      error: NotFound,
    }).annotate(OpenApi.Summary, "Delete a draft"),
  )
  .prefix("/api/protected/drafts")
  .middleware(UserAuthMiddleware);
