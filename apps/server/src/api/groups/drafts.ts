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
  RateLimitMiddleware,
  RateLimitPolicy,
} from "@/api/middleware/rate-limit";
import {
  BadRequest,
  Conflict,
  ContentWarning,
  DateTime,
  describeResponse,
  documentPaginationQuery,
  Forbidden,
  imageRequestBody,
  isUrlWithProtocol,
  NonNegativeInt,
  NotFound,
  omitBadRequest,
  PayloadTooLarge,
  paginationQueryFields,
  ServiceUnavailable,
  TooManyRequests,
  UnsupportedMediaType,
  UploadedImageResponse,
  Uri,
} from "@/api/schemas";
import { DRAFT_IMAGE_MAX_MIB } from "@/lib/draft-images";
import { PostMetadata } from "@/lib/metadata";

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
const Patch = <S extends Schema.Top>(schema: S, description: string) =>
  Schema.optionalKey(schema).pipe(
    Schema.annotateEncoded({
      description: `${description} Omit to keep unchanged.`,
    }),
  );

/**
 * PATCH field following JSON Merge Patch semantics: omit to keep the current
 * value unchanged, set to `null` to clear it.
 */
const Clearable = <S extends Schema.Top>(schema: S, description: string) =>
  Schema.optionalKey(Schema.NullOr(schema)).pipe(
    Schema.annotateEncoded({
      description: `${description} Omit to keep unchanged; set to \`null\` to clear.`,
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

const DRAFT_ID_PARAM = Schema.String.annotate({
  description: "Unique ID of the draft.",
});

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
).annotate({
  identifier: "DraftPublishStatus",
  description:
    "Current publishing state of a draft: `null` if never published, `pending` or `processing` while publishing (edits and deletion return `409`), or `failed` if the last publish attempt failed.",
});

export const Draft = Schema.Struct({
  id: Schema.String.annotate({
    description: "Unique ID of the draft.",
  }),
  title: Schema.String.annotate({
    description: "Title of the draft.",
  }),
  content: Schema.String.annotate({
    description: "Markdown body of the draft.",
  }),
  metaTitle: Schema.NullOr(Schema.String).annotate({
    description: "Optional SEO title override, or `null` if unset.",
  }),
  metaDescription: Schema.NullOr(Schema.String).annotate({
    description: "Optional SEO meta description override, or `null` if unset.",
  }),
  coverImage: Schema.NullOr(Uri).annotate({
    description:
      "Cover image URL (`http(s)://`, `ipfs://`, or `ar://`), or `null`.",
  }),
  tags: Schema.Array(Schema.String).annotate({
    description: "Topic tags attached to the draft.",
  }),
  canonicalUri: Schema.NullOr(Uri).annotate({
    description:
      "Canonical HTTP(S) URL of the original post if syndicated, or `null`.",
  }),
  contentWarning: Schema.NullOr(ContentWarning).pipe(
    Schema.annotateEncoded({
      description:
        "Content warning label (`nsfw`, `sensitive`, `spoiler`), or `null`.",
    }),
  ),
  publishStatus: DraftPublishStatus,
  createdAt: DateTime.pipe(
    Schema.annotateEncoded({
      description: "ISO 8601 timestamp when the draft was created.",
    }),
  ),
  updatedAt: DateTime.pipe(
    Schema.annotateEncoded({
      description: "ISO 8601 timestamp when the draft was last modified.",
    }),
  ),
}).annotate({
  identifier: "Draft",
  description:
    "Full draft belonging to the authenticated user, including Markdown content.",
});

export const DraftListItem = Schema.Struct({
  id: Schema.String.annotate({
    description: "Unique ID of the draft.",
  }),
  title: Schema.String.annotate({
    description: "Title of the draft.",
  }),
  metaTitle: Schema.NullOr(Schema.String).annotate({
    description: "Optional SEO title override, or `null` if unset.",
  }),
  metaDescription: Schema.NullOr(Schema.String).annotate({
    description: "Optional SEO meta description override, or `null` if unset.",
  }),
  coverImage: Schema.NullOr(Uri).annotate({
    description:
      "Cover image URL (`http(s)://`, `ipfs://`, or `ar://`), or `null`.",
  }),
  tags: Schema.Array(Schema.String).annotate({
    description: "Topic tags attached to the draft.",
  }),
  canonicalUri: Schema.NullOr(Uri).annotate({
    description:
      "Canonical HTTP(S) URL of the original post if syndicated, or `null`.",
  }),
  contentWarning: Schema.NullOr(ContentWarning).pipe(
    Schema.annotateEncoded({
      description:
        "Content warning label (`nsfw`, `sensitive`, `spoiler`), or `null`.",
    }),
  ),
  publishStatus: DraftPublishStatus,
  createdAt: DateTime.pipe(
    Schema.annotateEncoded({
      description: "ISO 8601 timestamp when the draft was created.",
    }),
  ),
  updatedAt: DateTime.pipe(
    Schema.annotateEncoded({
      description: "ISO 8601 timestamp when the draft was last modified.",
    }),
  ),
}).annotate({
  identifier: "DraftListItem",
  description:
    "Draft metadata returned in paginated draft lists (excludes Markdown content).",
});

export const DraftListResponse = Schema.Struct({
  results: Schema.Array(DraftListItem).annotate({
    description: "Drafts for the requested page, most recently updated first.",
  }),
  limit: NonNegativeInt.annotate({
    description: "Maximum number of drafts requested per page.",
  }),
  offset: NonNegativeInt.annotate({
    description: "Number of drafts skipped from the start of the list.",
  }),
  total: NonNegativeInt.annotate({
    description: "Total number of drafts owned by the authenticated user.",
  }),
}).annotate({
  identifier: "DraftListResponse",
  description: "Paginated list of the authenticated user's drafts.",
});

export const DraftListQuery = Schema.Struct(
  paginationQueryFields(DRAFT_LIST_MAX_LIMIT),
).annotate({ identifier: "DraftListQuery" });

export const CreateDraftPayload = Schema.Struct({
  title: Schema.optionalKey(DraftTitle).pipe(
    Schema.annotateEncoded({
      description: `Initial title (up to ${DRAFT_LIMITS.title} characters). Defaults to an empty string.`,
    }),
  ),
  content: Schema.optionalKey(DraftContent).pipe(
    Schema.annotateEncoded({
      description: `Initial Markdown body (up to ${DRAFT_LIMITS.content} characters). Defaults to an empty string.`,
    }),
  ),
  metaTitle: Schema.optionalKey(Schema.NullOr(DraftMetaTitle)).pipe(
    Schema.annotateEncoded({
      description: `Optional SEO title override (up to ${DRAFT_LIMITS.metaTitle} characters).`,
    }),
  ),
  metaDescription: Schema.optionalKey(Schema.NullOr(DraftMetaDescription)).pipe(
    Schema.annotateEncoded({
      description: `Optional SEO meta description override (up to ${DRAFT_LIMITS.metaDescription} characters).`,
    }),
  ),
  coverImage: Schema.optionalKey(Schema.NullOr(DraftCoverImage)).pipe(
    Schema.annotateEncoded({
      description: `Optional cover image URL (\`http(s)://\`, \`ipfs://\`, or \`ar://\`, up to ${DRAFT_LIMITS.coverImage} characters).`,
    }),
  ),
  tags: Schema.optionalKey(DraftTags).pipe(
    Schema.annotateEncoded({
      description: `Optional topic tags (up to ${DRAFT_LIMITS.tags} tags, each 1–${DRAFT_LIMITS.tag} characters). Defaults to \`[]\`.`,
    }),
  ),
  canonicalUri: Schema.optionalKey(Schema.NullOr(DraftCanonicalUri)).pipe(
    Schema.annotateEncoded({
      description: `Optional canonical HTTP(S) URL of the original post (up to ${DRAFT_LIMITS.canonicalUri} characters).`,
    }),
  ),
  contentWarning: Schema.optionalKey(Schema.NullOr(ContentWarning)).pipe(
    Schema.annotateEncoded({
      description:
        "Optional content warning label (`nsfw`, `sensitive`, or `spoiler`).",
    }),
  ),
}).annotate({
  identifier: "CreateDraftPayload",
  description:
    "Optional initial fields for a new draft. Send `{}` to create an empty draft.",
});

export const UpdateDraftPayload = Schema.Struct({
  title: Patch(DraftTitle, `Title (up to ${DRAFT_LIMITS.title} characters).`),
  content: Patch(
    DraftContent,
    `Markdown body (up to ${DRAFT_LIMITS.content} characters).`,
  ),
  metaTitle: Clearable(
    DraftMetaTitle,
    `SEO title override (up to ${DRAFT_LIMITS.metaTitle} characters).`,
  ),
  metaDescription: Clearable(
    DraftMetaDescription,
    `SEO meta description override (up to ${DRAFT_LIMITS.metaDescription} characters).`,
  ),
  coverImage: Clearable(
    DraftCoverImage,
    `Cover image URL (\`http(s)://\`, \`ipfs://\`, or \`ar://\`, up to ${DRAFT_LIMITS.coverImage} characters).`,
  ),
  // Tags are never null in a draft, so they are cleared with `[]`.
  tags: Patch(
    DraftTags,
    `Topic tags (up to ${DRAFT_LIMITS.tags} tags, each 1–${DRAFT_LIMITS.tag} characters). Pass \`[]\` to clear.`,
  ),
  canonicalUri: Clearable(
    DraftCanonicalUri,
    `Canonical HTTP(S) URL (up to ${DRAFT_LIMITS.canonicalUri} characters).`,
  ),
  contentWarning: Clearable(
    ContentWarning,
    "Content warning label (`nsfw`, `sensitive`, or `spoiler`).",
  ),
}).annotate({
  identifier: "UpdateDraftPayload",
  description:
    "Partial draft update using JSON Merge Patch semantics: omit fields to leave unchanged, or pass `null` to clear nullable fields.",
});

export const PublishDraftPayload = Schema.Struct({
  metadata: PostMetadata,
}).annotate({
  identifier: "PublishDraftPayload",
  description:
    "Signed post metadata payload submitted for publishing to Arweave.",
});

export const PublishDraftAccepted = Schema.Struct({
  draftId: Schema.String.annotate({
    description: "ID of the draft queued for publishing.",
  }),
  status: Schema.Literal("pending").annotate({
    description: "Initial publish job state (`pending`).",
  }),
}).annotate({
  identifier: "PublishDraftAccepted",
  description: "Acknowledgement that a draft publish job has been queued.",
});

export const PublishDraftStatus = Schema.Literals([
  "pending",
  "processing",
  "completed",
  "failed",
])
  .transform(["PENDING", "PROCESSING", "COMPLETED", "FAILED"])
  .annotate({
    identifier: "PublishDraftStatus",
    description:
      "Lifecycle state of an asynchronous publish job: `pending`, `processing`, `completed`, or `failed`.",
  });

export const PublishDraftStatusResponse = Schema.Struct({
  status: PublishDraftStatus,
  postId: Schema.NullOr(Schema.String).annotate({
    description:
      "Published post ID once `status` is `completed`, otherwise `null`.",
  }),
  arweaveTxId: Schema.NullOr(Schema.String).annotate({
    description: "Arweave transaction ID once assigned, otherwise `null`.",
  }),
}).annotate({
  identifier: "PublishDraftStatusResponse",
  description:
    "Current state and resulting identifiers of a draft publish job.",
});

export const DraftsGroup = HttpApiGroup.make("drafts")
  .annotate(OpenApi.Title, "Drafts")
  .annotate(
    OpenApi.Description,
    "Create, edit, delete, upload media to, and publish post drafts to Arweave.",
  )
  .add(
    HttpApiEndpoint.post("create", "/", {
      payload: CreateDraftPayload,
      success: HttpApiSchema.WithHeaders(HttpApiSchema.status(201)(Draft), {
        location: Schema.String.annotate({
          description:
            "Relative URL of the created draft (`/api/drafts/{draftId}`).",
        }),
      }),
      error: Forbidden,
    })
      .annotate(OpenApi.Summary, "Create draft")
      .annotate(
        OpenApi.Description,
        "Creates a new draft for the authenticated user, optionally pre-populated with initial fields (send `{}` for an empty draft). Returns `201 Created` with a `Location` header pointing to the created draft. Returns `403` if a draft quota is exceeded.",
      )
      .annotate(OpenApi.Transform, describeResponse(201, "Draft created.")),
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
        "Returns a paginated list of the authenticated user's drafts (without Markdown body content), ordered most recently updated first.",
      ),
    HttpApiEndpoint.get("get", "/:draftId", {
      params: {
        draftId: DRAFT_ID_PARAM,
      },
      success: Draft,
      error: NotFound,
    })
      .annotate(OpenApi.Summary, "Get draft")
      .annotate(
        OpenApi.Description,
        "Returns a single draft owned by the authenticated user, including its Markdown content and current `publishStatus`.",
      )
      .annotate(OpenApi.Transform, omitBadRequest),
    HttpApiEndpoint.patch("update", "/:draftId", {
      params: {
        draftId: DRAFT_ID_PARAM,
      },
      payload: UpdateDraftPayload,
      success: Draft,
      error: [NotFound, Conflict, Forbidden],
    })
      .annotate(OpenApi.Summary, "Update draft")
      .annotate(
        OpenApi.Description,
        "Partially updates a draft using JSON Merge Patch semantics: omitted fields stay unchanged, `null` clears nullable fields, and `[]` clears tags. Returns `409` while publishing and `403` if a draft quota is exceeded.",
      )
      .annotate(OpenApi.Transform, describeResponse(200, "Draft updated.")),
    HttpApiEndpoint.delete("delete", "/:draftId", {
      params: {
        draftId: DRAFT_ID_PARAM,
      },
      success: HttpApiSchema.NoContent.annotate({
        description: "Draft permanently deleted.",
      }),
      error: [NotFound, Conflict],
    })
      .annotate(OpenApi.Summary, "Delete draft")
      .annotate(
        OpenApi.Description,
        "Permanently deletes a draft owned by the authenticated user. Returns `409` while publishing.",
      )
      .annotate(OpenApi.Transform, omitBadRequest),
    HttpApiEndpoint.post("publish", "/:draftId/publish", {
      params: {
        draftId: DRAFT_ID_PARAM,
      },
      payload: PublishDraftPayload,
      success: HttpApiSchema.WithHeaders(
        HttpApiSchema.status(202)(PublishDraftAccepted),
        // The publish status to poll.
        {
          location: Schema.String.annotate({
            description:
              "Relative URL to poll publish progress (`/api/drafts/{draftId}/publish`).",
          }),
        },
      ),
      // The 403 is returned for metadata over the size limit of the user's
      // plan. The 429 is also returned once the daily publish limit of the
      // user or the global one of their plan is reached.
      error: [BadRequest, Forbidden, NotFound, Conflict, TooManyRequests],
    })
      .annotate(OpenApi.Summary, "Publish draft")
      .annotate(
        OpenApi.Description,
        "Validates wallet-signed `PostMetadata` for the draft and queues an asynchronous publish to Arweave. Returns `202 Accepted` with a `Location` header to poll publish status.\n\n- **`403 Forbidden`**: Signed metadata exceeds the current plan's size limit (see `GET /api/me/limits`).\n- **`409 Conflict`**: A publish is already in progress for this draft or the signature was already published.\n- **`429 Too Many Requests`**: Publish quota or rate limit exceeded.",
      )
      .annotate(OpenApi.Transform, describeResponse(202, "Publish job queued."))
      .annotate(RateLimitPolicy, "draftPublish"),
    HttpApiEndpoint.get("getPublishStatus", "/:draftId/publish", {
      params: {
        draftId: DRAFT_ID_PARAM,
      },
      success: PublishDraftStatusResponse,
      error: NotFound,
    })
      .annotate(OpenApi.Summary, "Get publish status")
      .annotate(
        OpenApi.Description,
        "Returns the current status of a draft's publish job. After publishing completes, returns `completed` along with `postId` and `arweaveTxId`. Returns `404` if the draft does not exist or publishing has not been started.",
      )
      .annotate(OpenApi.Transform, omitBadRequest),
    HttpApiEndpoint.post("uploadImage", "/:draftId/images", {
      params: {
        draftId: DRAFT_ID_PARAM,
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
      .annotate(OpenApi.Summary, "Upload draft image")
      .annotate(
        OpenApi.Description,
        `Uploads a raw JPEG, PNG, or WebP image (up to ${DRAFT_IMAGE_MAX_MIB} MiB) for use in a draft and returns its public URL, dimensions, byte size, and ThumbHash placeholder. Requires the **Pro** plan (\`403\` on Free).`,
      )
      .annotate(OpenApi.Override, {
        requestBody: imageRequestBody(
          `Raw image binary in JPEG, PNG, or WebP format (max ${DRAFT_IMAGE_MAX_MIB} MiB).`,
        ),
      })
      .annotate(OpenApi.Transform, describeResponse(201, "Image uploaded."))
      .annotate(RateLimitPolicy, "draftImageUpload"),
  )
  .prefix("/api/drafts")
  .middleware(RateLimitMiddleware)
  .middleware(UserAuthMiddleware);
