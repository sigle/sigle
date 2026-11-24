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
  // Actions allowed per rolling 24 hours.
  limit: NonNegativeInt,
  // Actions counted in the last 24 hours.
  used: NonNegativeInt,
  // When the oldest counted action stops counting, null when none.
  resetsAt: Schema.NullOr(DateTime),
}).annotate({ identifier: "DailyLimit" });

export const UserLimitsResponse = Schema.Struct({
  // Posts published, and publishes in flight.
  publish: DailyLimit,
}).annotate({ identifier: "UserLimitsResponse" });

const UserPlan = Schema.Literals(["free", "pro"]);

export const CurrentUserResponse = Schema.Struct({
  id: Schema.String,
  // Primary Stacks address of the user, used to read their public profile and
  // posts.
  address: Schema.String,
  plan: UserPlan,
}).annotate({ identifier: "CurrentUserResponse" });

export const UserPlanResponse = Schema.Struct({
  plan: UserPlan,
}).annotate({ identifier: "UserPlanResponse" });

export const MyPostListItem = Schema.Struct({
  ...PostListItem.fields,
  // When the user hid the post from Sigle, null while it is shown.
  hiddenAt: Schema.NullOr(DateTime),
}).annotate({ identifier: "MyPostListItem" });

export const MyPostListResponse = Schema.Struct({
  results: Schema.Array(MyPostListItem),
  limit: NonNegativeInt,
  offset: NonNegativeInt,
  total: NonNegativeInt,
}).annotate({ identifier: "MyPostListResponse" });

export const MyPostListQuery = Schema.Struct({
  ...paginationQueryFields(POST_LIST_MAX_LIMIT),
}).annotate({ identifier: "MyPostListQuery" });

export const PostVisibilityPayload = Schema.Struct({
  hidden: Schema.Boolean,
}).annotate({ identifier: "PostVisibilityPayload" });

export const PostVisibilityResponse = Schema.Struct({
  id: Schema.String,
  hiddenAt: Schema.NullOr(DateTime),
}).annotate({ identifier: "PostVisibilityResponse" });

export const MeGroup = HttpApiGroup.make("me")
  .annotate(
    OpenApi.Description,
    "The signed-in user, with their plan, limits, and published posts.",
  )
  .add(
    HttpApiEndpoint.get("get", "/", {
      success: CurrentUserResponse,
    })
      .annotate(OpenApi.Summary, "Get the signed-in user")
      .annotate(
        OpenApi.Description,
        "Return the signed-in user's id, primary Stacks address, and plan. Returns a 401 without a session.",
      ),
    HttpApiEndpoint.get("limits", "/limits", {
      success: UserLimitsResponse,
    })
      .annotate(OpenApi.Summary, "Get the signed-in user's limits")
      .annotate(
        OpenApi.Description,
        "Return the limits of the signed-in user's plan and how much of them is used, such as the posts they can still publish in the last 24 hours. Returns a 401 without a session.",
      ),
    HttpApiEndpoint.post("refreshPlan", "/plan/refresh", {
      success: UserPlanResponse,
    })
      .annotate(OpenApi.Summary, "Refresh the signed-in user's plan")
      .annotate(
        OpenApi.Description,
        "Activate Pro: check whether one of the signed-in user's wallets holds an Explorer Guild NFT, store the resulting plan, and return it. This is the only way to get Pro; Pro users are re-checked twice a day. Returns a 500 when the Stacks API cannot be reached, which keeps the stored plan, and a 401 without a session.",
      )
      .annotate(RateLimitPolicy, "planRefresh"),
    HttpApiEndpoint.get("listPosts", "/posts", {
      query: MyPostListQuery,
      success: MyPostListResponse,
    })
      .annotate(OpenApi.Summary, "List the signed-in user's posts")
      .annotate(
        OpenApi.Description,
        "List the posts the signed-in user published, newest first, including the ones they hid. Returns a 401 without a session.",
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
        postId: Schema.String,
      },
      payload: PostVisibilityPayload,
      success: PostVisibilityResponse,
      error: NotFound,
    })
      .annotate(OpenApi.Summary, "Hide or show a post")
      .annotate(
        OpenApi.Description,
        "Hide a post of the signed-in user from Sigle, or show it again. A hidden post is left out of the post list, its profile and RSS feed, and its page returns a 404, but it stays on Arweave. Returns a 404 for a post of another user, and a 401 without a session.",
      ),
  )
  .prefix("/api/me")
  .middleware(RateLimitMiddleware)
  .middleware(UserAuthMiddleware);
