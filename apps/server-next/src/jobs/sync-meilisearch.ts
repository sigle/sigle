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

    // Sync Posts
    let skip = 0;
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
