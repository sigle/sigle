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
  EmptyDescription,
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
                <EmptyDescription className="max-w-xs text-pretty">
                  Create a new draft to get started.
                </EmptyDescription>
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
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
