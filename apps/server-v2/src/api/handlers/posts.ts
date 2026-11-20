import { count, desc, eq, inArray } from "drizzle-orm";
import { DateTime, Effect } from "effect";
import { HttpApiBuilder } from "effect/http-api";
import { SigleApi } from "@/api";
import {
  POST_LIST_DEFAULT_LIMIT,
  type PostListQuery,
} from "@/api/groups/posts";
import { findProfiles } from "@/api/handlers/users";
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
    const profiles = yield* findProfiles([...new Set(addresses)]);

    return addresses.map((address) => ({
      address,
      profile: profiles.get(address)?.profile ?? null,
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

export const listPosts = (query: typeof PostListQuery.Type) =>
  Effect.gen(function* () {
    const author =
      query.author === undefined
        ? undefined
        : yield* parseStacksAddress(query.author);

    const db = yield* Database;
    const limit = query.limit ?? POST_LIST_DEFAULT_LIMIT;
    const offset = query.offset ?? 0;

    // Posts belong to a user, who can have several wallets, so an address
    // matches every post of the user owning it.
    const where =
      author === undefined
        ? undefined
        : inArray(
            post.userId,
            db
              .select({ userId: walletAddress.userId })
              .from(walletAddress)
              .where(eq(walletAddress.address, author)),
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
        coverWidth: mediaImage.width,
        coverHeight: mediaImage.height,
        coverThumbhash: mediaImage.thumbhash,
        tags: post.tags,
        canonicalUri: post.canonicalUri,
        arweaveTxId: post.arweaveTxId,
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
        createdAt: DateTime.fromDateUnsafe(item.createdAt),
        updatedAt: DateTime.fromDateUnsafe(item.updatedAt),
        author: authors[index],
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
    const [author] = yield* findAuthors([foundPost.userId]);

    return {
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
