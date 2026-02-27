import { z } from "zod";
import { consola } from "~/lib/consola";
import { prisma } from "~/lib/prisma";
import { sigleConfig } from "~/lib/sigle";
import { stacksApiClient } from "~/lib/stacks";

export const indexerIndexPostsSchema = z.object({
  action: z.literal("indexer-index-posts"),
  data: z.object({}),
});

export const executeIndexerIndexPostsJob = async (
  data: z.TypeOf<typeof indexerIndexPostsSchema>["data"],
) => {
  const latestPost = await prisma.post.findFirst({
    select: {
      id: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const test = await stacksApiClient.GET(
    "/extended/v1/contract/{contract_id}/events",
    {
      params: {
        path: {
          // TODO take from config - update the SDK
          contract_id: `${sigleConfig.protocolAddress}.responsible-aqua-scallop`,
        },
        query: {
          limit: 50,
        },
      },
    },
  );

  console.log("test", latestPost, test);
};
