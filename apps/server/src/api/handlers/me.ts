import { and, eq } from "drizzle-orm";
import { DateTime, Effect } from "effect";
import { HttpApiBuilder } from "effect/http-api";
import type { MyPostListQuery, PostVisibilityPayload } from "@/api/groups/me";
import { SigleApi } from "@/api";
import { findPostList } from "@/api/handlers/posts";
import { CurrentUser } from "@/api/middleware/auth-user";
import { InternalServerError, NotFound } from "@/api/schemas";
import { Database } from "@/db";
import { post } from "@/db/schema";
import {
  findUserPublishUsage,
  PlanService,
  PUBLISH_LIMITS,
  PUBLISH_MAX_BYTES,
} from "@/services/plan";
import { PostHogService } from "@/services/posthog";

export const getMe = Effect.gen(function* () {
  const user = yield* CurrentUser;

  return {
    id: user.id,
    address: user.address,
    plan: user.plan,
  };
});

const toDailyLimit = (
  limit: number,
  usage: { readonly used: number; readonly resetsAt: Date | null },
) => ({
  limit,
  used: usage.used,
  resetsAt:
    usage.resetsAt === null ? null : DateTime.fromDateUnsafe(usage.resetsAt),
});

export const getLimits = Effect.gen(function* () {
  const user = yield* CurrentUser;
  const db = yield* Database;
  const now = new Date();

  const publish = yield* findUserPublishUsage(db, { userId: user.id, now });

  return {
    publish: toDailyLimit(PUBLISH_LIMITS[user.plan], publish),
    publishMaxBytes: PUBLISH_MAX_BYTES[user.plan],
  };
});

export const refreshPlan = Effect.gen(function* () {
  const user = yield* CurrentUser;
  const plans = yield* PlanService;

  const plan = yield* plans.checkUserPlan(user.id).pipe(
    Effect.tapError((error) =>
      Effect.logWarning("Failed to refresh the user plan", { cause: error }),
    ),
    Effect.mapError(
      () =>
        new InternalServerError({
          message: "Failed to check your wallet, please try again.",
        }),
    ),
  );

  return { plan };
});

export const listMyPosts = (query: typeof MyPostListQuery.Type) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;

    return yield* findPostList(eq(post.userId, user.id), query);
  });

export const updatePostVisibility = (
  postId: string,
  payload: typeof PostVisibilityPayload.Type,
) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const db = yield* Database;
    const posthog = yield* PostHogService;

    const [updated] = yield* db
      .update(post)
      .set({ hiddenAt: payload.hidden ? new Date() : null })
      .where(and(eq(post.id, postId), eq(post.userId, user.id)))
      .returning({ id: post.id, hiddenAt: post.hiddenAt })
      .pipe(Effect.orDie);

    if (!updated) {
      return yield* new NotFound({ message: "Post not found" });
    }

    yield* posthog.capture({
      distinctId: user.id,
      event: payload.hidden ? "post hidden" : "post shown",
      properties: { postId },
    });

    return {
      id: updated.id,
      hiddenAt:
        updated.hiddenAt === null
          ? null
          : DateTime.fromDateUnsafe(updated.hiddenAt),
    };
  });

export const MeHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "me",
  (handlers) =>
    handlers
      .handle("get", () => getMe)
      .handle("limits", () => getLimits)
      .handle("refreshPlan", () => refreshPlan)
      .handle("listPosts", ({ query }) => listMyPosts(query))
      .handle("updatePostVisibility", ({ params, payload }) =>
        updatePostVisibility(params.postId, payload),
      ),
);
