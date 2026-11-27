import { POST_METADATA_LIMITS } from "@sigle/sdk";
import { Schema } from "effect";
import {
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  OpenApi,
} from "effect/http-api";
import { UserAuthMiddleware } from "@/api/middleware/auth-user";
import {
  GlobalRateLimitMiddleware,
  RateLimitMiddleware,
  RateLimitPolicy,
} from "@/api/middleware/rate-limit";
import {
  BadRequest,
  Conflict,
  ContentWarning,
  DateTime,
  documentPaginationQuery,
  Forbidden,
  imageRequestBody,
  isUrlWithProtocol,
  NonNegativeInt,
  NotFound,
  PayloadTooLarge,
  paginationQueryFields,
  ServiceUnavailable,
  TooManyRequests,
  UnsupportedMediaType,
  UploadedImageResponse,
} from "@/api/schemas";
import { DRAFT_IMAGE_MAX_MIB } from "@/lib/draft-images";
import { PostMetadata } from "@/lib/metadata";
import { PUBLISH_LIMITS } from "@/services/plan";

export const DRAFT_LIST_DEFAULT_LIMIT = 20;

export const DRAFT_LIST_MAX_LIMIT = 100;

/**
 * Drafts a user can have, publishes in flight included. Drafts are stored on
 * the server's volume, at up to `DRAFT_LIMITS.content` characters each. Fits
 * in one page of the draft list.
 */
export const DRAFT_COUNT_LIMIT = 100;

/**
 * Content all the drafts of a user can hold, in UTF-8 bytes. A single draft
 * can take about 3 MiB at its `DRAFT_LIMITS.content` length, so without it
 * `DRAFT_COUNT_LIMIT` drafts could take hundreds of MiB on the volume.
 */
export const DRAFT_CONTENT_TOTAL_MAX_MIB = 10;

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

/**
 * Draft field limits, the ones of the signed post metadata (`@sigle/sdk`), so
 * a draft that saves can be published.
 */
export const DRAFT_LIMITS = {
  title: POST_METADATA_LIMITS.title,
  // The editor stores Markdown; images are embedded by URL, not inline.
  content: POST_METADATA_LIMITS.content,
  metaTitle: POST_METADATA_LIMITS.metaTitle,
  metaDescription: POST_METADATA_LIMITS.metaDescription,
  canonicalUri: POST_METADATA_LIMITS.canonicalUri,
  coverImage: POST_METADATA_LIMITS.coverImage,
  tags: POST_METADATA_LIMITS.tags,
  tag: POST_METADATA_LIMITS.tag,
} as const;

const DraftTitle = Schema.String.check(Schema.isMaxLength(DRAFT_LIMITS.title));

const DraftContent = Schema.String.check(
  Schema.isMaxLength(DRAFT_LIMITS.content),
);

const DraftMetaTitle = Schema.String.check(
  Schema.isMaxLength(DRAFT_LIMITS.metaTitle),
);

const DraftMetaDescription = Schema.String.check(
  Schema.isMaxLength(DRAFT_LIMITS.metaDescription),
);

// Covers can live on Arweave or IPFS, like the cover image of the signed post
// metadata, which the thumbhash job resolves through the gateways.
const DraftCoverImage = Schema.String.annotate({ format: "uri" }).check(
  Schema.isMaxLength(DRAFT_LIMITS.coverImage),
  isUrlWithProtocol(
    ["http:", "https:", "ipfs:", "ar:"],
    "an http(s), ipfs:// or ar:// URL",
  ),
);

// The canonical URI points readers to the original web page of the post.
const DraftCanonicalUri = Schema.String.annotate({ format: "uri" }).check(
  Schema.isMaxLength(DRAFT_LIMITS.canonicalUri),
  isUrlWithProtocol(["http:", "https:"], "an http(s) URL"),
);

const DraftTags = Schema.mutable(
  Schema.Array(
    Schema.String.check(
      Schema.isMinLength(1),
      Schema.isMaxLength(DRAFT_LIMITS.tag),
    ),
  ).check(Schema.isMaxLength(DRAFT_LIMITS.tags)),
);

/**
 * Publish state of a draft: null until it is first published, `failed` once a
 * publish gave up. A published draft is deleted, so `completed` never shows.
 * While it is `pending` or `processing`, saving or deleting the draft returns
 * a 409. Like every enum in the API it is lowercase on the wire and decodes to
 * the uppercase database value.
 */
export const DraftPublishStatus = Schema.NullOr(
  Schema.Literals(["pending", "processing", "failed"]).transform([
    "PENDING",
    "PROCESSING",
    "FAILED",
  ]),
).annotate({ identifier: "DraftPublishStatus" });

export const Draft = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  content: Schema.String,
  metaTitle: Schema.NullOr(Schema.String),
  metaDescription: Schema.NullOr(Schema.String),
  coverImage: Schema.NullOr(Schema.String),
  tags: Schema.Array(Schema.String),
  canonicalUri: Schema.NullOr(Schema.String),
  contentWarning: Schema.NullOr(ContentWarning),
  publishStatus: DraftPublishStatus,
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
  contentWarning: Schema.NullOr(ContentWarning),
  publishStatus: DraftPublishStatus,
  createdAt: DateTime,
  updatedAt: DateTime,
}).annotate({ identifier: "DraftListItem" });

export const DraftListResponse = Schema.Struct({
  results: Schema.Array(DraftListItem),
  limit: NonNegativeInt,
  offset: NonNegativeInt,
  total: NonNegativeInt,
}).annotate({ identifier: "DraftListResponse" });

export const DraftListQuery = Schema.Struct(
  paginationQueryFields(DRAFT_LIST_MAX_LIMIT),
).annotate({ identifier: "DraftListQuery" });

export const CreateDraftPayload = Schema.Struct({
  title: Schema.optionalKey(DraftTitle),
  content: Schema.optionalKey(DraftContent),
  metaTitle: Schema.optionalKey(Schema.NullOr(DraftMetaTitle)),
  metaDescription: Schema.optionalKey(Schema.NullOr(DraftMetaDescription)),
  coverImage: Schema.optionalKey(Schema.NullOr(DraftCoverImage)),
  tags: Schema.optionalKey(DraftTags),
  canonicalUri: Schema.optionalKey(Schema.NullOr(DraftCanonicalUri)),
  contentWarning: Schema.optionalKey(Schema.NullOr(ContentWarning)),
}).annotate({ identifier: "CreateDraftPayload" });

export const UpdateDraftPayload = Schema.Struct({
  title: Patch(DraftTitle),
  content: Patch(DraftContent),
  metaTitle: Clearable(DraftMetaTitle),
  metaDescription: Clearable(DraftMetaDescription),
  coverImage: Clearable(DraftCoverImage),
  // Tags are never null in a draft, so they are cleared with `[]`.
  tags: Patch(DraftTags),
  canonicalUri: Clearable(DraftCanonicalUri),
  contentWarning: Clearable(ContentWarning),
}).annotate({ identifier: "UpdateDraftPayload" });

export const PublishDraftPayload = Schema.Struct({
  metadata: PostMetadata,
}).annotate({ identifier: "PublishDraftPayload" });

export const PublishDraftAccepted = Schema.Struct({
  draftId: Schema.String,
  status: Schema.Literal("pending"),
}).annotate({ identifier: "PublishDraftAccepted" });

export const PublishDraftStatus = Schema.Literals([
  "pending",
  "processing",
  "completed",
  "failed",
])
  .transform(["PENDING", "PROCESSING", "COMPLETED", "FAILED"])
  .annotate({ identifier: "PublishDraftStatus" });

export const PublishDraftStatusResponse = Schema.Struct({
  status: PublishDraftStatus,
  postId: Schema.NullOr(Schema.String),
  arweaveTxId: Schema.NullOr(Schema.String),
}).annotate({ identifier: "PublishDraftStatusResponse" });

export const DraftsGroup = HttpApiGroup.make("drafts")
  .annotate(
    OpenApi.Description,
    "The signed-in user's drafts: create, edit, delete, upload images, and publish them to Arweave.",
  )
  .add(
    HttpApiEndpoint.post("create", "/", {
      payload: CreateDraftPayload,
      success: HttpApiSchema.WithHeaders(HttpApiSchema.status(201)(Draft), {
        location: Schema.String,
      }),
      error: Forbidden,
    })
      .annotate(OpenApi.Summary, "Create a draft")
      .annotate(
        OpenApi.Description,
        `Create a new draft, optionally seeded with the provided fields. Every field is optional, send \`{}\` to create an empty draft. Returns a 403 once the user has ${DRAFT_COUNT_LIMIT} drafts, or when the content would take their drafts over ${DRAFT_CONTENT_TOTAL_MAX_MIB} MiB in total.`,
      ),
    HttpApiEndpoint.get("list", "/", {
      query: DraftListQuery,
      success: DraftListResponse,
    })
      .annotate(OpenApi.Summary, "List drafts")
      .annotate(
        OpenApi.Transform,
        documentPaginationQuery({
          maxLimit: DRAFT_LIST_MAX_LIMIT,
          defaultLimit: DRAFT_LIST_DEFAULT_LIMIT,
        }),
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
    })
      .annotate(OpenApi.Summary, "Get a draft")
      .annotate(
        OpenApi.Description,
        "Get a draft of the current user with its content and publish status.",
      ),
    HttpApiEndpoint.patch("update", "/:draftId", {
      params: {
        draftId: Schema.String,
      },
      payload: UpdateDraftPayload,
      success: Draft,
      error: [NotFound, Conflict, Forbidden],
    })
      .annotate(OpenApi.Summary, "Update a draft")
      .annotate(
        OpenApi.Description,
        `Partially update a draft following JSON Merge Patch semantics: omitted fields are left unchanged and \`null\` clears nullable fields. Returns a 409 while the draft is being published, and a 403 when a longer content would take the user's drafts over ${DRAFT_CONTENT_TOTAL_MAX_MIB} MiB in total.`,
      ),
    HttpApiEndpoint.delete("delete", "/:draftId", {
      params: {
        draftId: Schema.String,
      },
      success: HttpApiSchema.NoContent,
      error: [NotFound, Conflict],
    })
      .annotate(OpenApi.Summary, "Delete a draft")
      .annotate(
        OpenApi.Description,
        "Permanently delete a draft of the current user. Returns a 409 while the draft is being published.",
      ),
    HttpApiEndpoint.post("publish", "/:draftId/publish", {
      params: {
        draftId: Schema.String,
      },
      payload: PublishDraftPayload,
      success: HttpApiSchema.WithHeaders(
        HttpApiSchema.status(202)(PublishDraftAccepted),
        // The publish status to poll.
        { location: Schema.String },
      ),
      // The 429 is also returned once the daily publish limit of the user or
      // the global one of their plan is reached.
      error: [BadRequest, NotFound, Conflict, TooManyRequests],
    })
      .annotate(OpenApi.Summary, "Publish a draft")
      .annotate(
        OpenApi.Description,
        `Validate signed post metadata and enqueue an asynchronous publish job. Returns a 409 while the draft is being published to Arweave for another signature. Returns a 429 once the user published the daily limit of their plan in the last 24 hours, ${PUBLISH_LIMITS.free} posts on Free and ${PUBLISH_LIMITS.pro} on Pro, counting the publishes in flight. Also returns a 429 once all users of the plan together reached its global daily limit.`,
      )
      .annotate(RateLimitPolicy, "draftPublish"),
    HttpApiEndpoint.get("getPublishStatus", "/:draftId/publish", {
      params: {
        draftId: Schema.String,
      },
      success: PublishDraftStatusResponse,
      error: NotFound,
    })
      .annotate(OpenApi.Summary, "Get draft publish status")
      .annotate(
        OpenApi.Description,
        "Poll the asynchronous publishing status of a draft.",
      ),
    HttpApiEndpoint.post("uploadImage", "/:draftId/images", {
      params: {
        draftId: Schema.String,
      },
      // Every upload creates a new content-addressed image.
      success: HttpApiSchema.status(201)(UploadedImageResponse),
      // The group's `RateLimitMiddleware` adds the 429 and 500 responses.
      error: [
        BadRequest,
        Forbidden,
        NotFound,
        PayloadTooLarge,
        ServiceUnavailable,
        UnsupportedMediaType,
      ],
    })
      .annotate(OpenApi.Summary, "Upload a draft image")
      .annotate(
        OpenApi.Description,
        `Upload an image to embed in a draft as a raw binary body, up to ${DRAFT_IMAGE_MAX_MIB} MiB. The image is re-encoded as WebP and served from the CDN. Pro plan only, free users get a 403 and can embed external image URLs instead.`,
      )
      .annotate(OpenApi.Override, { requestBody: imageRequestBody })
      .annotate(RateLimitPolicy, "draftImageUpload"),
  )
  .prefix("/api/drafts")
  .middleware(RateLimitMiddleware)
  .middleware(UserAuthMiddleware)
  .middleware(GlobalRateLimitMiddleware);
