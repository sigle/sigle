"use client";

import { PostCard } from "@/components/Shared/Post/Card";
import { sigleApiClient, sigleApiFetchClient } from "@/lib/sigle";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export const ExplorePostsList = () => {
  const { data: initialPosts } = sigleApiClient.useSuspenseQuery(
    "get",
    "/api/posts/list",
    {
      params: {
        query: {
          limit: PAGE_SIZE,
        },
      },
    },
  );

  const [posts, setPosts] = useState(initialPosts.results || []);
  const [page, setPage] = useState(2); // Start from page 2 since page 1 is already fetched
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView({
    threshold: 1.0,
  });

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await sigleApiFetchClient.GET("/api/posts/list", {
          params: {
            query: {
              limit: PAGE_SIZE,
              offset: (page - 1) * PAGE_SIZE,
              page,
            },
          },
        });
        const newPosts = response.data?.results || [];
        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        setHasMore(newPosts.length > 0); // If no more posts, stop loading
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        toast.error("Failed to fetch posts.");
      } finally {
        setIsLoading(false);
      }
    };

    if (inView && hasMore && !isLoading) {
      fetchPosts();
      setPage((prevPage) => prevPage + 1);
    }
  }, [inView, hasMore, isLoading, page]);

  return (
    <>
      <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {isLoading && <div className="text-center mt-4">Loading...</div>}
      <div ref={ref} className="h-10" />
    </>
  );
};
