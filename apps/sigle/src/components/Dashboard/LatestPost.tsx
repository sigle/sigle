"use client";

import { IconPencil } from "@tabler/icons-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/auth-hooks";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";
import { NextLink } from "../Shared/NextLink";
import { Button } from "../ui/button";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";

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
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconPencil size={20} />
                </EmptyMedia>
                <EmptyTitle>No Published Posts</EmptyTitle>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  nativeButton={false}
                  render={
                    <NextLink href="/p/new">Publish your first post</NextLink>
                  }
                />
              </EmptyContent>
            </Empty>
          ) : null}

          {post ? (
            <>
              <div className="rounded-md bg-muted p-4">
                <h3 className="line-clamp-2 text-lg font-bold">
                  {post.metaTitle || post.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground uppercase">
                  {format(new Date(post.createdAt), "MMM dd")}
                </p>
                <Button
                  size="lg"
                  className="mt-3 w-full"
                  nativeButton={false}
                  render={
                    <NextLink href={Routes.post({ postId: post.id })}>
                      View post
                    </NextLink>
                  }
                />
              </div>

              {post.collectible ? (
                <div className="mt-5 -mb-4">
                  {/* TODO once we have that info from backend */}
                  {/* <Flex
                gap="5"
                align="center"
                justify="between"
                className="border-b border-solid border-border py-5 last:border-b-0"
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
                  <div className="flex items-center justify-between gap-5 border-b border-solid border-border py-5 last:border-b-0">
                    <p>Collected</p>
                    <p className="font-medium">{post.collectible.collected}</p>
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
