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
import { findProfile } from "@/api/handlers/users";
import { BadRequest, NotFound } from "@/api/schemas";
import { Database } from "@/db";
import { mediaImage, post, postOts, walletAddress } from "@/db/schema";
import { findPrimaryWalletAddress } from "@/services/users";

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

export const getPost = (postId: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [found] = yield* db
      .select({
        post,
        coverWidth: mediaImage.width,
        coverHeight: mediaImage.height,
        coverThumbhash: mediaImage.thumbhash,
        otsStatus: postOts.status,
        otsTxId: postOts.otsTxId,
        bitcoinBlockHeight: postOts.bitcoinBlockHeight,
        bitcoinTimestamp: postOts.bitcoinTimestamp,
      })
      .from(post)
      .leftJoin(mediaImage, eq(mediaImage.id, post.coverImage))
      .leftJoin(postOts, eq(postOts.postId, post.id))
      .where(eq(post.id, postId))
      .limit(1)
      .pipe(Effect.orDie);

    if (!found) {
      return yield* new NotFound({ message: "Post not found" });
    }

    const foundPost = found.post;
    const authorAddress = yield* findPrimaryWalletAddress(foundPost.userId);

    const authorProfile = yield* findProfile(authorAddress);

    return {
      id: foundPost.id,
      title: foundPost.title,
      content: foundPost.content,
      excerpt: foundPost.excerpt,
      metaTitle: foundPost.metaTitle,
      metaDescription: foundPost.metaDescription,
      coverImage:
        foundPost.coverImage === null
          ? null
          : {
              url: foundPost.coverImage,
              width: found.coverWidth,
              height: found.coverHeight,
              thumbhash: found.coverThumbhash,
            },
      tags: foundPost.tags ?? [],
      canonicalUri: foundPost.canonicalUri,
      metadataUri: foundPost.metadataUri,
      arweaveTxId: foundPost.arweaveTxId,
      arweaveBlockHeight: foundPost.arweaveBlockHeight,
      createdAt: DateTime.fromDateUnsafe(foundPost.createdAt),
      updatedAt: DateTime.fromDateUnsafe(foundPost.updatedAt),
      author: {
        address: authorAddress,
        profile: authorProfile?.profile ?? null,
      },
      opentimestamps:
        found.otsStatus === null
          ? null
          : {
              status: found.otsStatus,
              otsTxId: found.otsTxId,
              bitcoinBlockHeight: found.bitcoinBlockHeight,
              bitcoinTimestamp:
                found.bitcoinTimestamp === null
                  ? null
                  : DateTime.fromDateUnsafe(found.bitcoinTimestamp),
            },
    };
  });

export const PostsHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "posts",
  (handlers) =>
    handlers
      .handle("list", ({ query }) => listPosts(query))
      .handle("get", ({ params }) => getPost(params.postId)),
);
