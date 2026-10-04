"use client";

import type { paths } from "@sigle/sdk";
import type { QueryObserverResult } from "@tanstack/react-query";
import { IconDotsVertical, IconPencil } from "@tabler/icons-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { NextLink } from "@/components/Shared/NextLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";

export default function DashboardDrafts() {
  const {
    data: drafts,
    isLoading: loadingDrafts,
    error: errorDrafts,
    refetch: refetchDrafts,
  } = sigleApiClient.useQuery("get", "/api/protected/drafts", {
    params: {
      query: {
        limit: "50",
      },
    },
  });

  return (
    <div className="py-10">
      <h2 className="mb-5 text-2xl font-bold">Drafts</h2>

      <Card>
        <CardContent>
          {loadingDrafts ? (
            <div className="flex justify-center py-7">
              <Spinner />
            </div>
          ) : null}

          {errorDrafts ? (
            <div className="flex justify-center py-7">
              <p className="text-sm text-destructive">
                An error occurred, please try again later. {errorDrafts.message}
              </p>
            </div>
          ) : null}

          {drafts?.results.length === 0 ? (
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

          {drafts?.results.map((draft) => (
            <Draft key={draft.id} draft={draft} refetchDrafts={refetchDrafts} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

const Draft = ({
  draft,
  refetchDrafts,
}: {
  draft: paths["/api/protected/drafts"]["get"]["responses"][200]["content"]["application/json"]["results"][number];
  refetchDrafts: () => Promise<QueryObserverResult<unknown, unknown>>;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const { mutateAsync: deletePost } = sigleApiClient.useMutation(
    "delete",
    "/api/protected/drafts/{draftId}",
    {
      onError: (error: { message: string }) => {
        toast.error("Failed to upload metadata", {
          description: error.message,
        });
      },
    },
  );

  const onDelete = async () => {
    // oxlint-disable-next-line no-alert
    const ok = confirm("Are you sure you want to delete this draft?");

    if (!ok) return;

    setIsDeleting(true);
    await deletePost({
      params: {
        path: {
          draftId: draft.id,
        },
      },
    });
    await refetchDrafts();
    toast.message("Draft deleted");
  };

  const heading =
    draft.metaTitle || draft.title ? (
      <h3 className="line-clamp-2 text-lg font-medium">
        {draft.metaTitle || draft.title}
      </h3>
    ) : (
      <h3 className="line-clamp-2 text-lg font-medium text-muted-foreground">
        No title
      </h3>
    );

  return (
    <div className="border-b border-solid border-border py-5 first:pt-0 last:border-b-0 last:pb-0">
      <NextLink href={Routes.editPost({ postId: draft.id })}>
        {heading}
      </NextLink>
      <div className="flex items-center justify-between">
        <p className="mt-3 text-xs text-muted-foreground">
          Created {format(new Date(draft.createdAt), "MMM dd, yyyy")} • Last
          updated {format(new Date(draft.updatedAt), "MMM dd, yyyy h:mm a")}
        </p>
        {isDeleting ? <Spinner /> : null}
        {!isDeleting ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon">
                  <IconDotsVertical size={16} />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={
                  <NextLink href={Routes.editPost({ postId: draft.id })}>
                    Edit
                  </NextLink>
                }
              />
              <DropdownMenuItem onClick={onDelete}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  );
};
