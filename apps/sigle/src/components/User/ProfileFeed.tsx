"use client";

import type { paths } from "@sigle/sdk";
import type { InfiniteData } from "@tanstack/react-query";
import {
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { buttonVariants } from "@/components/ui/button";
import { useIsClient } from "@/hooks/useIsClient";
import { useSession } from "@/lib/auth-hooks";
import { cn } from "@/lib/cn";
import { flattenPages, removeFromPages } from "@/lib/pagination";
import { profilePostsQueryOptions } from "@/lib/profile-posts";
import { sigleApiClient } from "@/lib/sigle";
import { LoadMore } from "../Shared/LoadMore";
import { NextLink } from "../Shared/NextLink";
import { PostListItem } from "../Shared/Post/ListItem";
import { PostListItemSkeleton } from "../Shared/Post/ListItem/Skeleton";

interface ProfileFeedProps {
  user: paths["/api/users/{address}"]["get"]["responses"]["200"]["content"]["application/json"];
}

export const ProfileFeed = ({ user }: ProfileFeedProps) => {
  const isClient = useIsClient();
  const { data: session } = useSession();

  const { data: me } = sigleApiClient.useQuery(
    "get",
    "/api/me",
    {},
    { enabled: !!session },
  );

  const options = profilePostsQueryOptions(user.address);
  const queryClient = useQueryClient();

  const { data, hasNextPage, fetchNextPage, isFetching } =
    useSuspenseInfiniteQuery(options);

  const posts = flattenPages(data.pages);

  // The public list is cached for a minute, so a hidden post is removed from
  // the loaded pages instead of refetching them.
  const onHiddenChange = async (postId: string, hidden: boolean) => {
    if (!hidden) {
      void queryClient.invalidateQueries({ queryKey: options.queryKey });

      return;
    }

    // A response to a request sent before the hide would bring the post back.
    await queryClient.cancelQueries({ queryKey: options.queryKey });

    queryClient.setQueryData<InfiniteData<(typeof data.pages)[number]>>(
      options.queryKey,
      (old) => old && { ...old, pages: removeFromPages(old.pages, postId) },
    );
  };

  // The server renders without the session, so the first client render must
  // not depend on it either: this component hydrates after its posts load, by
  // which time the client may already know the user.
  if (
    posts.length === 0 &&
    !hasNextPage &&
    isClient &&
    user.address === me?.address
  ) {
    return (
      <section className="mt-4 border-y border-border py-14 text-center">
        <h3 className="headline text-2xl">Write your first story</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-pretty text-muted-foreground">
          Your published stories show up here, archived on Arweave and
          timestamped on Bitcoin.
        </p>
        <NextLink
          href="/p/new"
          className={cn(buttonVariants({ size: "lg" }), "mt-6")}
        >
          Start writing
        </NextLink>
      </section>
    );
  }

  if (posts.length === 0 && !hasNextPage) {
    return (
      <p className="mt-4 border-y border-border py-6 text-sm text-muted-foreground">
        Nothing published yet.
      </p>
    );
  }

  return (
    <>
      <ul className="mt-4 border-t border-border">
        {posts.map((post) => (
          <PostListItem
            key={post.id}
            post={post}
            onHiddenChange={onHiddenChange}
          />
        ))}
      </ul>

      {hasNextPage ? (
        <LoadMore
          shown={posts.length}
          total={data.pages.at(-1)?.total ?? posts.length}
          // A next page started during a refetch would cancel it.
          loading={isFetching}
          onLoadMore={() => fetchNextPage()}
        />
      ) : null}
    </>
  );
};

export const ProfileFeedSkeleton = () => (
  <ul className="mt-4 border-t border-border">
    <PostListItemSkeleton />
    <PostListItemSkeleton />
    <PostListItemSkeleton />
  </ul>
);
