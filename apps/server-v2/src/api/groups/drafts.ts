import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";
import { UserAuthMiddleware } from "@/api/middleware/auth-user";
import { NotFound } from "@/api/schemas";

const DraftListLimit = Schema.FiniteFromString.pipe(
  Schema.check(
    Schema.isGreaterThanOrEqualTo(1),
    Schema.isLessThanOrEqualTo(100),
  ),
);

export const CreateDraftResponse = Schema.Struct({
  id: Schema.String,
});

export const DraftListItem = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  content: Schema.String,
  metaTitle: Schema.NullOr(Schema.String),
  metaDescription: Schema.NullOr(Schema.String),
  coverImage: Schema.NullOr(Schema.String),
  txId: Schema.NullOr(Schema.String),
  txStatus: Schema.NullOr(Schema.String),
  createdAt: Schema.String,
  updatedAt: Schema.String,
});

export const Draft = Schema.Struct({
  id: Schema.String,
  type: Schema.Literals(["draft", "published"]),
  title: Schema.String,
  content: Schema.String,
  metaTitle: Schema.NullOr(Schema.String),
  metaDescription: Schema.NullOr(Schema.String),
  coverImage: Schema.NullOr(Schema.String),
  tags: Schema.NullOr(Schema.Array(Schema.String)),
  canonicalUri: Schema.NullOr(Schema.String),
  txId: Schema.NullOr(Schema.String),
  txStatus: Schema.NullOr(Schema.String),
  createdAt: Schema.String,
  updatedAt: Schema.String,
});

export const UpdateDraftPayload = Schema.Struct({
  title: Schema.String,
  content: Schema.String,
  metaTitle: Schema.optionalKey(Schema.String),
  metaDescription: Schema.optionalKey(Schema.String),
  coverImage: Schema.optionalKey(Schema.String),
  tags: Schema.optionalKey(Schema.Array(Schema.String)),
  canonicalUri: Schema.optionalKey(Schema.String),
});

export const UpdateDraftResponse = Schema.Struct({
  id: Schema.String,
});

export const DraftsGroup = HttpApiGroup.make("drafts")
  .add(
    HttpApiEndpoint.post("create", "/create", {
      success: CreateDraftResponse,
    }),
    HttpApiEndpoint.get("list", "/list", {
      query: {
        limit: DraftListLimit,
      },
      success: Schema.Array(DraftListItem),
    }),
    HttpApiEndpoint.get("get", "/:draftId", {
      params: {
        draftId: Schema.String,
      },
      success: Draft,
      error: NotFound,
    }),
    HttpApiEndpoint.post("update", "/:draftId/update", {
      params: {
        draftId: Schema.String,
      },
      payload: UpdateDraftPayload,
      success: UpdateDraftResponse,
      error: NotFound,
    }),
    HttpApiEndpoint.post("delete", "/:draftId/delete", {
      params: {
        draftId: Schema.String,
      },
      success: Schema.Boolean,
      error: NotFound,
    }),
  )
  .prefix("/api/protected/drafts")
  .middleware(UserAuthMiddleware);
