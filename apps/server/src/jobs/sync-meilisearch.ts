import { z } from "zod";
import { consola } from "~/lib/consola";
import { defineJob } from "~/lib/jobs";
import { meilisearchClient } from "~/lib/meilisearch";
import { prisma } from "~/lib/prisma";

const BATCH_SIZE = 200;

export const syncMeilisearchJob = defineJob("sync-meilisearch")
  .input(z.object({}))
  .options({})
  .work(async () => {
    consola.debug("Starting Meilisearch sync...");

    // Sync Users
    let skip = 0;
    while (true) {
      const users = await prisma.user.findMany({
        take: BATCH_SIZE,
        skip,
        select: {
          id: true,
          profile: {
            select: {
              displayName: true,
            },
          },
        },
      });

      if (users.length === 0) break;

      const formattedUsers = users.map((user) => ({
        id: user.id,
        displayName: user.profile?.displayName,
      }));

      await meilisearchClient.index("users").addDocuments(formattedUsers);
      consola.debug(`Synced ${users.length} users (offset: ${skip})`);

      skip += BATCH_SIZE;
    }

    // Sync Posts
    skip = 0;
    while (true) {
      const posts = await prisma.post.findMany({
        take: BATCH_SIZE,
        skip,
        select: {
          id: true,
          title: true,
          excerpt: true,
          createdAt: true,
          userId: true,
        },
      });

      if (posts.length === 0) break;

      const formattedPosts = posts.map((post) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        createdAt: post.createdAt,
      }));

      await meilisearchClient.index("posts").addDocuments(formattedPosts);
      consola.debug(`Synced ${posts.length} posts (offset: ${skip})`);

      skip += BATCH_SIZE;
    }

    consola.debug("sync-meilisearch", {
      nbUsers: await prisma.user.count(),
      nbPosts: await prisma.post.count(),
    });
  });
