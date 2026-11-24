import { and, count, desc, eq, inArray, isNull, type SQL } from "drizzle-orm";
import { DateTime, Effect } from "effect";
import { HttpApiBuilder, HttpApiSchema } from "effect/http-api";
import { SigleApi } from "@/api";
import {
  POST_LIST_DEFAULT_LIMIT,
  type PostListQuery,
} from "@/api/groups/posts";
import { findExplorerAddresses, findProfiles } from "@/api/handlers/users";
import { PUBLIC_CACHE_CONTROL } from "@/api/middleware/etag";
import { NotFound } from "@/api/schemas";
import { Database } from "@/db";
import { mediaImage, post, postOts, walletAddress } from "@/db/schema";
import { parseStacksAddress } from "@/lib/stacks-address";
import { findPrimaryWalletAddresses } from "@/services/users";

/**
 * Author of each user's posts, in the order of `userIds`: their primary wallet
 * address with its profile.
 */
const findAuthors = (userIds: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    const addresses = yield* findPrimaryWalletAddresses(userIds);
    const uniqueAddresses = [...new Set(addresses)];
    const profiles = yield* findProfiles(uniqueAddresses);
    const explorers = yield* findExplorerAddresses(uniqueAddresses);

    return addresses.map((address) => ({
      address,
      profile: profiles.get(address)?.profile ?? null,
      isExplorer: explorers.has(address),
    }));
  });

const toMediaImage = (
  url: string | null,
  image: {
    readonly width: number | null;
    readonly height: number | null;
    readonly thumbhash: string | null;
  },
) => (url === null ? null : { url, ...image });

/**
 * A page of the posts matching `where`, newest first, with the total count.
 * Each post carries `hiddenAt`, which the public list schema leaves out.
 */
export const findPostList = (
  where: SQL | undefined,
  page: { readonly limit?: number; readonly offset?: number },
) =>
  Effect.gen(function* () {
    const db = yield* Database;
    const limit = page.limit ?? POST_LIST_DEFAULT_LIMIT;
    const offset = page.offset ?? 0;

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
        coverWidth: mediaImage.width,
        coverHeight: mediaImage.height,
        coverThumbhash: mediaImage.thumbhash,
        tags: post.tags,
        canonicalUri: post.canonicalUri,
        arweaveTxId: post.arweaveTxId,
        hiddenAt: post.hiddenAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        userId: post.userId,
      })
      .from(post)
      .leftJoin(mediaImage, eq(mediaImage.id, post.coverImage))
      .where(where)
      .orderBy(desc(post.createdAt), desc(post.id))
      .limit(limit)
      .offset(offset)
      .pipe(Effect.orDie);

    const authors = yield* findAuthors(posts.map((item) => item.userId));

    return {
      results: posts.map((item, index) => ({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        coverImage: toMediaImage(item.coverImage, {
          width: item.coverWidth,
          height: item.coverHeight,
          thumbhash: item.coverThumbhash,
        }),
        tags: item.tags ?? [],
        canonicalUri: item.canonicalUri,
        arweaveTxId: item.arweaveTxId,
        hiddenAt:
          item.hiddenAt === null
            ? null
            : DateTime.fromDateUnsafe(item.hiddenAt),
        createdAt: DateTime.fromDateUnsafe(item.createdAt),
        updatedAt: DateTime.fromDateUnsafe(item.updatedAt),
        author: authors[index],
      })),
      limit,
      offset,
      total: totals.count,
    };
  });

export const listPosts = (query: typeof PostListQuery.Type) =>
  Effect.gen(function* () {
    const author =
      query.author === undefined
        ? undefined
        : yield* parseStacksAddress(query.author);

    const db = yield* Database;

    // Posts belong to a user, who can have several wallets, so an address
    // matches every post of the user owning it.
    const byAuthor =
      author === undefined
        ? undefined
        : inArray(
            post.userId,
            db
              .select({ userId: walletAddress.userId })
              .from(walletAddress)
              .where(eq(walletAddress.address, author)),
          );

    const body = yield* findPostList(and(isNull(post.hiddenAt), byAuthor), {
      limit: query.limit,
      offset: query.offset,
    });

    return HttpApiSchema.withHeaders({
      body,
      headers: { "cache-control": PUBLIC_CACHE_CONTROL },
    });
  });

export const getPost = (postId: string) =>
  Effect.gen(function* () {
    const db = yield* Database;

    const [found] = yield* (
      db
        .select({
          post,
          coverWidth: mediaImage.width,
          coverHeight: mediaImage.height,
          coverThumbhash: mediaImage.thumbhash,
          otsStatus: postOts.status,
          otsContentHash: postOts.contentHash,
          otsTxId: postOts.otsTxId,
          bitcoinBlockHeight: postOts.bitcoinBlockHeight,
          bitcoinBlockHash: postOts.bitcoinBlockHash,
          bitcoinTimestamp: postOts.bitcoinTimestamp,
        })
        .from(post)
        .leftJoin(mediaImage, eq(mediaImage.id, post.coverImage))
        .leftJoin(postOts, eq(postOts.postId, post.id))
        // A hidden post is a 404 for everyone, its author included.
        .where(and(eq(post.id, postId), isNull(post.hiddenAt)))
        .limit(1)
        .pipe(Effect.orDie)
    );

    if (!found) {
      return yield* new NotFound({ message: "Post not found" });
    }

    const foundPost = found.post;
    const [author] = yield* findAuthors([foundPost.userId]);

    const body = {
      id: foundPost.id,
      title: foundPost.title,
      content: foundPost.content,
      excerpt: foundPost.excerpt,
      metaTitle: foundPost.metaTitle,
      metaDescription: foundPost.metaDescription,
      coverImage: toMediaImage(foundPost.coverImage, {
        width: found.coverWidth,
        height: found.coverHeight,
        thumbhash: found.coverThumbhash,
      }),
      tags: foundPost.tags ?? [],
      canonicalUri: foundPost.canonicalUri,
      metadataUri: foundPost.metadataUri,
      arweaveTxId: foundPost.arweaveTxId,
      arweaveBlockHeight: foundPost.arweaveBlockHeight,
      createdAt: DateTime.fromDateUnsafe(foundPost.createdAt),
      updatedAt: DateTime.fromDateUnsafe(foundPost.updatedAt),
      author,
      opentimestamps:
        found.otsStatus === null || found.otsContentHash === null
          ? null
          : {
              status: found.otsStatus,
              contentHash: found.otsContentHash,
              otsTxId: found.otsTxId,
              bitcoinBlockHeight: found.bitcoinBlockHeight,
              bitcoinBlockHash: found.bitcoinBlockHash,
              bitcoinTimestamp:
                found.bitcoinTimestamp === null
                  ? null
                  : DateTime.fromDateUnsafe(found.bitcoinTimestamp),
            },
    };

    return HttpApiSchema.withHeaders({
      body,
      headers: { "cache-control": PUBLIC_CACHE_CONTROL },
    });
  });

export const PostsHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "posts",
  (handlers) =>
    handlers
      .handle("list", ({ query }) => listPosts(query))
      .handle("get", ({ params }) => getPost(params.postId)),
);
