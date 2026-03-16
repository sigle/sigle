"use client";

import { IconPencil } from "@tabler/icons-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";
import { getExplorerTransactionUrl } from "@/lib/stacks";
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

export const LatestDrafts = () => {
  const {
    data: drafts,
    isLoading: loadingDrafts,
    error: errorDrafts,
  } = sigleApiClient.useQuery("get", "/api/protected/drafts/list", {
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
        <Button
          className="text-muted-foreground"
          size="xs"
          variant="link"
          render={<NextLink href="/dashboard/drafts">View all</NextLink>}
        />
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

          {!loadingDrafts && drafts?.length === 0 ? (
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
                <Button
                  render={<NextLink href="/p/new">Create a new draft</NextLink>}
                />
              </EmptyContent>
            </Empty>
          ) : null}

          {drafts?.map((draft) => {
            const heading =
              draft.metaTitle || draft.title ? (
                <h3 className="line-clamp-2 text-lg font-bold">
                  {draft.metaTitle || draft.title}
                </h3>
              ) : (
                <h3 className="line-clamp-2 text-lg font-bold text-muted-foreground">
                  No title
                </h3>
              );

            return (
              <div
                key={draft.id}
                className="border-b border-solid border-gray-6 py-5 first:pt-0 last:border-b-0 last:pb-0"
              >
                {draft.txStatus === "pending" && draft.txId && (
                  <Badge
                    className="mb-2"
                    render={
                      <a
                        href={getExplorerTransactionUrl(draft.txId)}
                        target="_blank"
                        rel="noreferrer"
                      />
                    }
                  >
                    Publishing: Transaction pending
                  </Badge>
                )}
                {draft.txStatus === "pending" ? (
                  heading
                ) : (
                  <NextLink href={Routes.editPost({ postId: draft.id })}>
                    {heading}
                  </NextLink>
                )}
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
