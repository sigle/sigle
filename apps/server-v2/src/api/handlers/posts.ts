import {
  addressToString,
  createAddress,
  validateStacksAddress,
} from "@stacks/transactions";
import { count, desc, eq, inArray } from "drizzle-orm";
import { DateTime, Effect } from "effect";
import { HttpApiBuilder } from "effect/http-api";
import { SigleApi } from "@/api";
import {
  POST_LIST_DEFAULT_LIMIT,
  type PostListQuery,
} from "@/api/groups/posts";
import { BadRequest } from "@/api/schemas";
import { Database } from "@/db";
import { post, walletAddress } from "@/db/schema";

export const listPosts = (query: typeof PostListQuery.Type) =>
  Effect.gen(function* () {
    if (
      query.username !== undefined &&
      !validateStacksAddress(query.username)
    ) {
      return yield* new BadRequest({ message: "Invalid Stacks address" });
    }

    const db = yield* Database;
    const limit = query.limit ?? POST_LIST_DEFAULT_LIMIT;
    const offset = query.offset ?? 0;

    // Posts belong to a user, who can have several wallets, so an address
    // matches every post of the user owning it. Wallet addresses are stored in
    // their canonical c32 form, which validation does not enforce: decoding
    // folds confusable characters such as `O` and `0`.
    const where =
      query.username === undefined
        ? undefined
        : inArray(
            post.userId,
            db
              .select({ userId: walletAddress.userId })
              .from(walletAddress)
              .where(
                eq(
                  walletAddress.address,
                  addressToString(createAddress(query.username)),
                ),
              ),
          );

    const [totals] = yield* db
      .select({ count: count() })
      .from(post)
      .where(where)
      .pipe(Effect.orDie);

    const posts = yield* db
      .select({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        coverImage: post.coverImage,
        tags: post.tags,
        canonicalUri: post.canonicalUri,
        arweaveTxId: post.arweaveTxId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })
      .from(post)
      .where(where)
      .orderBy(desc(post.createdAt), desc(post.id))
      .limit(limit)
      .offset(offset)
      .pipe(Effect.orDie);

    return {
      results: posts.map((item) => ({
        ...item,
        tags: item.tags ?? [],
        createdAt: DateTime.fromDateUnsafe(item.createdAt),
        updatedAt: DateTime.fromDateUnsafe(item.updatedAt),
      })),
      limit,
      offset,
      total: totals.count,
    };
  });

export const PostsHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "posts",
  (handlers) => handlers.handle("list", ({ query }) => listPosts(query)),
);
