import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api";
import {
  POST_LIST_DEFAULT_LIMIT,
  POST_LIST_MAX_LIMIT,
  PostListItem,
} from "@/api/groups/posts";
import { UserAuthMiddleware } from "@/api/middleware/auth-user";
import {
  RateLimitMiddleware,
  RateLimitPolicy,
} from "@/api/middleware/rate-limit";
import {
  DateTime,
  documentPaginationQuery,
  NonNegativeInt,
  NotFound,
  paginationQueryFields,
} from "@/api/schemas";

export const DailyLimit = Schema.Struct({
  limit: NonNegativeInt.annotate({
    description: "Maximum actions allowed per rolling 24-hour window.",
  }),
  used: NonNegativeInt.annotate({
    description: "Actions consumed in the last 24 hours.",
  }),
  resetsAt: Schema.NullOr(DateTime).pipe(
    Schema.annotateEncoded({
      description:
        "ISO 8601 timestamp when the oldest counted action ages out of the 24-hour window, or `null` when `used` is `0`.",
    }),
  ),
}).annotate({
  identifier: "DailyLimit",
  description: "Usage snapshot for a rolling 24-hour quota.",
});

export const UserLimitsResponse = Schema.Struct({
  publish: DailyLimit,
  publishMaxBytes: NonNegativeInt.annotate({
    description:
      "Maximum signed post metadata size the user can publish, in UTF-8 bytes.",
  }),
}).annotate({
  identifier: "UserLimitsResponse",
  description: "Current plan quotas and usage for the authenticated user.",
});

const UserPlan = Schema.Literals(["free", "pro"]).annotate({
  description: "Subscription tier of the user (`free` or `pro`).",
});

export const CurrentUserResponse = Schema.Struct({
  id: Schema.String.annotate({
    description: "Unique account ID of the authenticated user.",
  }),
  address: Schema.String.annotate({
    description: "Primary Stacks address of the authenticated user.",
  }),
  plan: UserPlan,
}).annotate({
  identifier: "CurrentUserResponse",
  description: "Account identity and plan of the authenticated user.",
});

export const UserPlanResponse = Schema.Struct({
  plan: UserPlan,
}).annotate({
  identifier: "UserPlanResponse",
  description: "Updated plan tier of the authenticated user.",
});

export const MyPostListItem = Schema.Struct({
  ...PostListItem.fields,
  hiddenAt: Schema.NullOr(DateTime).pipe(
    Schema.annotateEncoded({
      description:
        "ISO 8601 timestamp when the post was hidden from Sigle, or `null` while publicly visible.",
    }),
  ),
}).annotate({
  identifier: "MyPostListItem",
  description:
    "Summary of one of the authenticated user's published posts, including visibility status.",
});

export const MyPostListResponse = Schema.Struct({
  results: Schema.Array(MyPostListItem).annotate({
    description: "Published posts for the requested page, newest first.",
  }),
  limit: NonNegativeInt.annotate({
    description: "Maximum number of posts requested per page.",
  }),
  offset: NonNegativeInt.annotate({
    description: "Number of posts skipped from the start of the list.",
  }),
  total: NonNegativeInt.annotate({
    description: "Total number of posts published by the authenticated user.",
  }),
}).annotate({
  identifier: "MyPostListResponse",
  description: "Paginated list of the authenticated user's published posts.",
});

export const MyPostListQuery = Schema.Struct({
  ...paginationQueryFields(POST_LIST_MAX_LIMIT),
}).annotate({ identifier: "MyPostListQuery" });

export const PostVisibilityPayload = Schema.Struct({
  hidden: Schema.Boolean.annotate({
    description:
      "Set to `true` to hide the post on Sigle, or `false` to make it publicly visible again.",
  }),
}).annotate({
  identifier: "PostVisibilityPayload",
  description: "Desired visibility state for a published post.",
});

export const PostVisibilityResponse = Schema.Struct({
  id: Schema.String.annotate({
    description: "ID of the updated post.",
  }),
  hiddenAt: Schema.NullOr(DateTime).pipe(
    Schema.annotateEncoded({
      description:
        "ISO 8601 timestamp when the post was hidden, or `null` when publicly visible.",
    }),
  ),
}).annotate({
  identifier: "PostVisibilityResponse",
  description: "Updated visibility state of a published post.",
});

export const MeGroup = HttpApiGroup.make("me")
  .annotate(OpenApi.Title, "Account")
  .annotate(
    OpenApi.Description,
    "Manage the authenticated user's account, plan, publish quotas, and published post visibility.",
  )
  .add(
    HttpApiEndpoint.get("get", "/", {
      success: CurrentUserResponse,
    })
      .annotate(OpenApi.Summary, "Get current user")
      .annotate(
        OpenApi.Description,
        "Returns the authenticated user's account ID, primary Stacks address, and current plan.",
      ),
    HttpApiEndpoint.get("limits", "/limits", {
      success: UserLimitsResponse,
    })
      .annotate(OpenApi.Summary, "Get account limits")
      .annotate(
        OpenApi.Description,
        "Returns the authenticated user's current plan quotas and publish usage.",
      ),
    HttpApiEndpoint.post("refreshPlan", "/plan/refresh", {
      success: UserPlanResponse,
    })
      .annotate(OpenApi.Summary, "Refresh plan")
      .annotate(
        OpenApi.Description,
        "Checks Explorer Guild NFT ownership for the authenticated user, updates their plan (`free` or `pro`), and returns the result.",
      )
      .annotate(RateLimitPolicy, "planRefresh"),
    HttpApiEndpoint.get("listPosts", "/posts", {
      query: MyPostListQuery,
      success: MyPostListResponse,
    })
      .annotate(OpenApi.Summary, "List my posts")
      .annotate(
        OpenApi.Description,
        "Returns a paginated list of posts published by the authenticated user, newest first, including hidden posts.",
      )
      .annotate(
        OpenApi.Transform,
        documentPaginationQuery({
          maxLimit: POST_LIST_MAX_LIMIT,
          defaultLimit: POST_LIST_DEFAULT_LIMIT,
        }),
      ),
    HttpApiEndpoint.put("updatePostVisibility", "/posts/:postId/visibility", {
      params: {
        postId: Schema.String.annotate({
          description: "Post ID (its Arweave transaction ID).",
        }),
      },
      payload: PostVisibilityPayload,
      success: PostVisibilityResponse,
      error: NotFound,
    })
      .annotate(OpenApi.Summary, "Set post visibility")
      .annotate(
        OpenApi.Description,
        "Hides one of the authenticated user's published posts from Sigle or restores it. Hidden posts are omitted from public post lists, profiles, RSS feeds, and `GET /api/posts/{postId}`, while remaining on Arweave. Returns `404` if the post does not exist or belongs to another user.",
      ),
  )
  .prefix("/api/me")
  .middleware(RateLimitMiddleware)
  .middleware(UserAuthMiddleware);
