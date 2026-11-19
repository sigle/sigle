import { Schema } from "effect";
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  OpenApi,
} from "effect/http-api";
import {
  UserAuthMiddleware,
  WhitelistedUserMiddleware,
} from "@/api/middleware/auth-user";
import {
  RateLimitMiddleware,
  RateLimitPolicy,
} from "@/api/middleware/rate-limit";
import {
  BadRequest,
  Conflict,
  documentPaginationQuery,
  Forbidden,
  imageRequestBody,
  InternalServerError,
  NotFound,
  PayloadTooLarge,
  paginationQueryFields,
  TooManyRequests,
  UnsupportedMediaType,
} from "@/api/schemas";
import { DRAFT_IMAGE_MAX_MIB } from "@/lib/draft-images";
import { PostMetadata } from "@/lib/metadata";

export const DRAFT_LIST_DEFAULT_LIMIT = 20;

export const DRAFT_LIST_MAX_LIMIT = 100;

const DateTime = Schema.DateTimeUtcFromString.pipe(
  Schema.annotateEncoded({ format: "date-time" }),
);

/**
 * PATCH field: omit to leave the current value unchanged.
 */
const Patch = <S extends Schema.Top>(schema: S) =>
  Schema.optionalKey(schema).pipe(
    Schema.annotateEncoded({
      description: "Omit to keep the current value unchanged.",
    }),
  );

/**
 * PATCH field following JSON Merge Patch semantics: omit to keep the current
 * value unchanged, set to `null` to clear it.
 */
const Clearable = <S extends Schema.Top>(schema: S) =>
  Schema.optionalKey(Schema.NullOr(schema)).pipe(
    Schema.annotateEncoded({
      description:
        "Omit to keep the current value unchanged, set to null to clear it.",
    }),
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

export const DraftListQuery = Schema.Struct(
  paginationQueryFields(DRAFT_LIST_MAX_LIMIT),
).annotate({ identifier: "DraftListQuery" });

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
  title: Patch(Schema.String),
  content: Patch(Schema.String),
  metaTitle: Clearable(Schema.String),
  metaDescription: Clearable(Schema.String),
  coverImage: Clearable(Schema.String),
  tags: Clearable(Schema.mutable(Schema.Array(Schema.String))),
  canonicalUri: Clearable(Schema.String),
}).annotate({ identifier: "UpdateDraftPayload" });

export const PublishDraftPayload = Schema.Struct({
  metadata: PostMetadata,
}).annotate({ identifier: "PublishDraftPayload" });

export const PublishDraftAccepted = Schema.Struct({
  draftId: Schema.String,
  status: Schema.Literal("PENDING"),
}).annotate({ identifier: "PublishDraftAccepted" });

export const PublishDraftStatus = Schema.Literals([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]).annotate({ identifier: "PublishDraftStatus" });

export const PublishDraftStatusResponse = Schema.Struct({
  status: PublishDraftStatus,
  postId: Schema.NullOr(Schema.String),
  arweaveId: Schema.NullOr(Schema.String),
}).annotate({ identifier: "PublishDraftStatusResponse" });

export const UploadDraftImageResponse = Schema.Struct({
  url: Schema.String,
  key: Schema.String,
  width: Schema.Int,
  height: Schema.Int,
  // Base64 ThumbHash placeholder for the optimized image.
  thumbhash: Schema.String,
}).annotate({ identifier: "UploadDraftImageResponse" });

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
        OpenApi.Transform,
        documentPaginationQuery(DRAFT_LIST_MAX_LIMIT),
      )
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
      error: [NotFound, Conflict],
    })
      .annotate(OpenApi.Summary, "Update a draft")
      .annotate(
        OpenApi.Description,
        "Partially update a draft following JSON Merge Patch semantics: omitted fields are left unchanged and `null` clears nullable fields. Returns a 409 while the draft is being published.",
      ),
    HttpApiEndpoint.delete("delete", "/:draftId", {
      params: {
        draftId: Schema.String,
      },
      success: HttpApiSchema.NoContent,
      error: NotFound,
    }).annotate(OpenApi.Summary, "Delete a draft"),
    HttpApiEndpoint.post("publish", "/:draftId/publish", {
      params: {
        draftId: Schema.String,
      },
      payload: PublishDraftPayload,
      success: HttpApiSchema.status(202)(PublishDraftAccepted),
      error: [BadRequest, NotFound],
    })
      .middleware(RateLimitMiddleware)
      .annotate(OpenApi.Summary, "Publish a draft")
      .annotate(
        OpenApi.Description,
        "Validate signed post metadata and enqueue an asynchronous publish job.",
      ),
    HttpApiEndpoint.get("getPublishStatus", "/:draftId/publish", {
      params: {
        draftId: Schema.String,
      },
      success: PublishDraftStatusResponse,
      error: [BadRequest, NotFound],
    })
      .annotate(OpenApi.Summary, "Get draft publish status")
      .annotate(
        OpenApi.Description,
        "Poll the asynchronous publishing status of a draft.",
      ),
    HttpApiEndpoint.put("uploadImage", "/:draftId/images", {
      params: {
        draftId: Schema.String,
      },
      success: UploadDraftImageResponse,
      error: [
        BadRequest,
        Forbidden,
        NotFound,
        PayloadTooLarge,
        TooManyRequests,
        UnsupportedMediaType,
        InternalServerError,
      ],
    })
      .annotate(OpenApi.Summary, "Upload a draft image")
      .annotate(
        OpenApi.Description,
        `Upload an image to embed in a draft as a raw binary body, up to ${DRAFT_IMAGE_MAX_MIB} MiB. The image is re-encoded as WebP and served from the CDN. Pro plan only, free users get a 403 and can embed external image URLs instead. Counts against the daily (429) and total (403) upload quotas.`,
      )
      .annotate(OpenApi.Override, { requestBody: imageRequestBody })
      .annotate(RateLimitPolicy, "draftImageUpload"),
  )
  .prefix("/api/protected/drafts")
  .middleware(RateLimitMiddleware)
  .middleware(WhitelistedUserMiddleware)
  .middleware(UserAuthMiddleware);
