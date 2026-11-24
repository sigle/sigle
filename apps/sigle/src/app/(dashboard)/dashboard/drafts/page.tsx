"use client";

import type { paths } from "@sigle/sdk";
import type { QueryObserverResult } from "@tanstack/react-query";
import { IconDots, IconPlus } from "@tabler/icons-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { LoadMore } from "@/components/Shared/LoadMore";
import { NextLink } from "@/components/Shared/NextLink";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";
import { flattenPages, getNextOffset, PAGE_SIZE } from "@/lib/pagination";
import { Routes } from "@/lib/routes";
import { sigleApiClient } from "@/lib/sigle";

export default function DashboardDrafts() {
  const {
    data,
    isLoading: loadingDrafts,
    error: errorDrafts,
    refetch: refetchDrafts,
    hasNextPage,
    fetchNextPage,
    isFetching,
  } = sigleApiClient.useInfiniteQuery(
    "get",
    "/api/drafts",
    { params: { query: { limit: PAGE_SIZE } } },
    {
      pageParamName: "offset",
      initialPageParam: 0,
      getNextPageParam: getNextOffset,
    },
  );

  const drafts = data ? flattenPages(data.pages) : undefined;
  const total = data?.pages.at(-1)?.total;
  const isEmpty = total === 0;

  return (
    <div className="space-y-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="headline text-3xl">
          Drafts
          {total ? (
            <span className="ml-2 font-mono text-base font-normal tracking-normal text-muted-foreground">
              {total}
            </span>
          ) : null}
        </h2>

        {!isEmpty ? (
          <NextLink href="/p/new" className={buttonVariants()}>
            <IconPlus />
            New post
          </NextLink>
        ) : null}
      </div>

      {isEmpty ? (
        <section className="border-y border-border py-14 text-center">
          <h3 className="headline text-2xl">No drafts yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-pretty text-muted-foreground">
            Drafts save as you type, so you can pick up a story right where you
            left off.
          </p>
          <NextLink
            href="/p/new"
            className={cn(buttonVariants({ size: "lg" }), "mt-6")}
          >
            Start writing
          </NextLink>
        </section>
      ) : (
        <div>
          <ul className="border-t border-border">
            {loadingDrafts
              ? [0, 1, 2].map((index) => (
                  <li key={index} className="border-b border-border py-4">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="mt-2 h-4 w-40" />
                  </li>
                ))
              : null}

            {errorDrafts ? (
              <li className="border-b border-border py-4 text-sm text-destructive">
                An error occurred, please try again later. {errorDrafts.message}
              </li>
            ) : null}

            {drafts?.map((draft) => (
              <Draft
                key={draft.id}
                draft={draft}
                refetchDrafts={refetchDrafts}
              />
            ))}
          </ul>

          {drafts && hasNextPage ? (
            <LoadMore
              shown={drafts.length}
              total={total ?? drafts.length}
              // A refetch after a delete must finish first: a next page started meanwhile
              // cancels it and requests an offset that skips a draft.
              loading={isFetching}
              onLoadMore={() => fetchNextPage()}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

const Draft = ({
  draft,
  refetchDrafts,
}: {
  draft: paths["/api/drafts"]["get"]["responses"][200]["content"]["application/json"]["results"][number];
  refetchDrafts: () => Promise<QueryObserverResult<unknown, unknown>>;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const { mutateAsync: deletePost } = sigleApiClient.useMutation(
    "delete",
    "/api/drafts/{draftId}",
    {
      onError: (error: { message: string }) => {
        toast.error("Failed to delete draft", {
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

  const title = draft.metaTitle || draft.title;

  return (
    <li className="flex items-center gap-4 border-b border-border">
      <NextLink
        href={Routes.editPost({ postId: draft.id })}
        className="group min-w-0 flex-1 py-4"
      >
        <span className="line-clamp-1 headline text-lg underline-offset-4 group-hover:underline">
          {title || <span className="text-muted-foreground">Untitled</span>}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">
          Edited{" "}
          <time dateTime={draft.updatedAt}>
            {format(new Date(draft.updatedAt), "MMM d, yyyy 'at' h:mm a")}
          </time>
        </span>
      </NextLink>

      {isDeleting ? <Spinner /> : null}
      {!isDeleting ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Draft actions"
                className="text-muted-foreground"
              >
                <IconDots size={16} />
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
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </li>
  );
};
