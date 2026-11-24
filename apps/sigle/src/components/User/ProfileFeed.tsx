"use client";

import type { paths } from "@sigle/sdk";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { buttonVariants } from "@/components/ui/button";
import { useIsClient } from "@/hooks/useIsClient";
import { useSession } from "@/lib/auth-hooks";
import { cn } from "@/lib/cn";
import { flattenPages, getNextOffset, PAGE_SIZE } from "@/lib/pagination";
import { sigleApiClient, sigleApiFetchClient } from "@/lib/sigle";
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

  // openapi-react-query has no suspense variant of infinite queries, and the
  // server renders the first page, so this calls the fetch client itself.
  const query = { author: user.address, limit: PAGE_SIZE };

  const { data, hasNextPage, fetchNextPage, isFetching } =
    useSuspenseInfiniteQuery({
      queryKey: ["get", "/api/posts", { params: { query } }],
      queryFn: async ({ pageParam, signal }) => {
        const { data: page, error } = await sigleApiFetchClient.GET(
          "/api/posts",
          { params: { query: { ...query, offset: pageParam } }, signal },
        );

        if (error) {
          throw error;
        }

        return page;
      },
      initialPageParam: 0,
      getNextPageParam: getNextOffset,
    });

  const posts = flattenPages(data.pages);

  // The server renders without the session, so the first client render must
  // not depend on it either: this component hydrates after its posts load, by
  // which time the client may already know the user.
  if (posts.length === 0 && isClient && user.address === me?.address) {
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

  if (posts.length === 0) {
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
          <PostListItem key={post.id} post={post} />
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
