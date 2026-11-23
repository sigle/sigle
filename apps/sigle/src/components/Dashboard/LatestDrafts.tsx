"use client";

import { IconPencil } from "@tabler/icons-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
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

export const LatestDrafts = () => {
  const {
    data: drafts,
    isLoading: loadingDrafts,
    error: errorDrafts,
  } = sigleApiClient.useQuery("get", "/api/drafts", {
    params: {
      query: {
        limit: 5,
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Drafts</p>
        <NextLink
          href="/dashboard/drafts"
          className={cn(
            buttonVariants({ size: "xs", variant: "link" }),
            "text-muted-foreground",
          )}
        >
          View all
        </NextLink>
      </div>
      <Card className="mt-2">
        <CardContent>
          {loadingDrafts ? (
            <div className="flex justify-center py-7">
              <Spinner />
            </div>
          ) : null}

          {errorDrafts ? (
            <div className="flex justify-center py-7">
              <p className="text-destructive">
                An error occurred, please try again later. Error:{" "}
                {errorDrafts.message}
              </p>
            </div>
          ) : null}

          {!loadingDrafts && drafts?.results.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconPencil size={20} />
                </EmptyMedia>
                <EmptyTitle>No Drafts</EmptyTitle>
                <EmptyDescription className="max-w-xs text-pretty">
                  Create a new draft to get started.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <NextLink href="/p/new" className={buttonVariants()}>
                  Create a new draft
                </NextLink>
              </EmptyContent>
            </Empty>
          ) : null}

          {drafts?.results.map((draft) => {
            const heading =
              draft.metaTitle || draft.title ? (
                <h3 className="line-clamp-2 headline text-xl">
                  {draft.metaTitle || draft.title}
                </h3>
              ) : (
                <h3 className="line-clamp-2 headline text-xl text-muted-foreground">
                  No title
                </h3>
              );

            return (
              <div
                key={draft.id}
                className="border-b border-solid border-border py-5 first:pt-0 last:border-b-0 last:pb-0"
              >
                <NextLink href={Routes.editPost({ postId: draft.id })}>
                  {heading}
                </NextLink>
                <p className="mt-3 text-xs text-muted-foreground uppercase">
                  {format(new Date(draft.createdAt), "MMM dd")}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
