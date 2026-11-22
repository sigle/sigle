"use client";

import { IconPencil } from "@tabler/icons-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";
import { NextLink } from "../Shared/NextLink";
import { buttonVariants } from "../ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";

export const LatestPost = ({ address }: { address: string }) => {
  const { data: posts } = sigleApiClient.useSuspenseQuery("get", "/api/posts", {
    params: {
      query: {
        author: address,
        limit: 1,
      },
    },
  });

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
                <NextLink href="/p/new" className={buttonVariants()}>
                  Publish your first post
                </NextLink>
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
                <NextLink
                  href={Routes.post({ postId: post.id })}
                  className={cn(buttonVariants({ size: "lg" }), "mt-3 w-full")}
                >
                  View post
                </NextLink>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
