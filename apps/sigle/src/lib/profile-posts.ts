import { infiniteQueryOptions } from "@tanstack/react-query";
import { getNextOffset, PAGE_SIZE } from "@/lib/pagination";
import { sigleApiFetchClient } from "@/lib/sigle";

/**
 * The posts of a profile, a page at a time. Shared by the profile page, which
 * prefetches the first page on the server, and the feed that renders it.
 *
 * openapi-react-query has no suspense variant of infinite queries, and the
 * server renders the first page, so this calls the fetch client itself.
 */
export const profilePostsQueryOptions = (address: string) => {
  const query = { author: address, limit: PAGE_SIZE };

  return infiniteQueryOptions({
    queryKey: ["get", "/api/posts", { params: { query } }],
    queryFn: async ({ pageParam, signal }) => {
      const { data: page, error } = await sigleApiFetchClient.GET(
        "/api/posts",
        {
          params: { query: { ...query, offset: pageParam } },
          signal,
        },
      );

      if (error) {
        throw error;
      }

      return page;
    },
    initialPageParam: 0,
    getNextPageParam: getNextOffset,
    // The profile page hydrates the first page fresh from the server, and the API caches public reads for a minute.
    staleTime: 60_000,
  });
};
