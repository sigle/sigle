"use client";

import type { paths } from "@sigle/sdk";
import { IconDots } from "@tabler/icons-react";
import { format } from "date-fns";
import { useState } from "react";
import { LoadMore } from "@/components/Shared/LoadMore";
import { NextLink } from "@/components/Shared/NextLink";
import {
  arweaveStoryUrl,
  HidePostDialog,
  usePostVisibility,
} from "@/components/Shared/Post/HidePostDialog";
import { PostShareDialog } from "@/components/Shared/Post/PostShareDialog";
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

export default function DashboardPublished() {
  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetching } =
    sigleApiClient.useInfiniteQuery(
      "get",
      "/api/me/posts",
      { params: { query: { limit: PAGE_SIZE } } },
      {
        pageParamName: "offset",
        initialPageParam: 0,
        getNextPageParam: getNextOffset,
      },
    );

  const posts = data ? flattenPages(data.pages) : undefined;
  const total = data?.pages.at(-1)?.total;
  const isEmpty = total === 0;

  return (
    <div className="space-y-8 py-10">
      <div>
        <h2 className="headline text-3xl">
          Published
          {total ? (
            <span className="ml-2 font-mono text-base font-normal tracking-normal text-muted-foreground">
              {total}
            </span>
          ) : null}
        </h2>
        <p className="mt-2 text-sm text-pretty text-muted-foreground">
          Hidden stories are off your blog but stay archived on Arweave.
        </p>
      </div>

      {isEmpty ? (
        <section className="border-y border-border py-14 text-center">
          <h3 className="headline text-2xl">Nothing published yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-pretty text-muted-foreground">
            When you publish, your story is archived on Arweave and timestamped
            on Bitcoin.
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
            {isLoading
              ? [0, 1, 2].map((index) => (
                  <li key={index} className="border-b border-border py-4">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="mt-2 h-4 w-40" />
                  </li>
                ))
              : null}

            {error ? (
              <li className="border-b border-border py-4 text-sm text-destructive">
                An error occurred, please try again later. {error.message}
              </li>
            ) : null}

            {posts?.map((post) => (
              <PublishedPost key={post.id} post={post} />
            ))}
          </ul>

          {posts && hasNextPage ? (
            <LoadMore
              shown={posts.length}
              total={total ?? posts.length}
              // A next page started during a refetch would cancel it.
              loading={isFetching}
              onLoadMore={() => fetchNextPage()}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

const PublishedPost = ({
  post,
}: {
  post: paths["/api/me/posts"]["get"]["responses"][200]["content"]["application/json"]["results"][number];
}) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [hideDialogOpen, setHideDialogOpen] = useState(false);
  const { setHidden, isPending } = usePostVisibility();

  const isHidden = post.hiddenAt !== null;
  const title = post.metaTitle || post.title;
  const arweaveUrl = arweaveStoryUrl(post.arweaveTxId);

  const date = (
    <span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
      <time dateTime={post.createdAt}>
        Published {format(new Date(post.createdAt), "MMM d, yyyy")}
      </time>
      {isHidden ? (
        <span className="rounded-sm border border-border px-1.5 font-mono text-[0.65rem] tracking-wide uppercase">
          Hidden
        </span>
      ) : null}
    </span>
  );

  return (
    <li className="flex items-center gap-4 border-b border-border">
      {isHidden ? (
        // A hidden story has no Sigle page, only its Arweave archive.
        <div className="min-w-0 flex-1 py-4">
          <span className="line-clamp-1 headline text-lg text-muted-foreground">
            {title || "Untitled"}
          </span>
          {date}
        </div>
      ) : (
        <NextLink
          href={Routes.post({ postId: post.id })}
          className="group min-w-0 flex-1 py-4"
        >
          <span className="line-clamp-1 headline text-lg underline-offset-4 group-hover:underline">
            {title || <span className="text-muted-foreground">Untitled</span>}
          </span>
          {date}
        </NextLink>
      )}

      {isPending ? <Spinner /> : null}
      {!isPending ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Story actions"
                className="text-muted-foreground"
              >
                <IconDots size={16} />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="min-w-40">
            {isHidden ? (
              <>
                <DropdownMenuItem onClick={() => setHidden(post.id, false)}>
                  Show on blog
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={
                    <a href={arweaveUrl} target="_blank" rel="noreferrer">
                      View on Arweave
                    </a>
                  }
                />
              </>
            ) : (
              <>
                <DropdownMenuItem
                  render={
                    <NextLink href={Routes.post({ postId: post.id })}>
                      View
                    </NextLink>
                  }
                />
                <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setHideDialogOpen(true)}>
                  Hide story
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      <PostShareDialog
        post={post}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
      <HidePostDialog
        post={post}
        open={hideDialogOpen}
        onOpenChange={setHideDialogOpen}
      />
    </li>
  );
};
