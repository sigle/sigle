"use client";

import { Button, Heading, Text } from "@radix-ui/themes";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/auth-hooks";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";
import { NextLink } from "../Shared/NextLink";

export const LatestPost = () => {
  const { data: session } = useSession();
  const { data: posts } = sigleApiClient.useSuspenseQuery(
    "get",
    "/api/posts/list",
    {
      params: {
        query: {
          username: session?.user.id || "",
          limit: 1,
        },
      },
    },
  );
  const post = posts.results[0];

  return (
    <div>
      <div className="flex h-6 items-center justify-between">
        <p className="text-sm font-medium">Latest post</p>
      </div>
      <Card className="mt-2">
        <CardContent>
          {!post ? (
            <div className="flex flex-col items-center justify-center gap-4 py-7">
              <Text size="2" color="gray">
                No post yet
              </Text>
              <Button size="2" color="gray" highContrast>
                <NextLink href="/p/new">Publish your first post!</NextLink>
              </Button>
            </div>
          ) : null}

          {post ? (
            <>
              <div className="rounded-2 bg-gray-3 p-4">
                <Heading size="4" className="line-clamp-2">
                  {post.metaTitle || post.title}
                </Heading>
                <Text mt="2" as="p" color="gray" size="1" className="uppercase">
                  {format(new Date(post.createdAt), "MMM dd")}
                </Text>
                <Button
                  mt="3"
                  color="gray"
                  highContrast
                  size="3"
                  className="w-full"
                  asChild
                >
                  <NextLink href={Routes.post({ postId: post.id })}>
                    View post
                  </NextLink>
                </Button>
              </div>

              {post.collectible ? (
                <div className="mt-5 -mb-4">
                  {/* TODO once we have that info from backend */}
                  {/* <Flex
                gap="5"
                align="center"
                justify="between"
                className="border-b border-solid border-gray-6 py-5 last:border-b-0"
              >
                <Text size="2">Earned</Text>
                <Text size="2" weight="medium">
                  {
                    // TODO that amount from backend
                    0
                  }{" "}
                  <Text size="1" color="gray">
                    sBTC
                  </Text>
                </Text>
              </Flex> */}
                  <div className="flex items-center justify-between gap-5 border-b border-solid border-gray-6 py-5 last:border-b-0">
                    <Text size="2">Collected</Text>
                    <Text size="2" weight="medium">
                      {post.collectible.collected}
                    </Text>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
