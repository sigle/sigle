import { Pagination } from "@/component/Shared/Pagination";
import { PostCard } from "@/component/Shared/Post/Card";
import { sigleApiFetchClient } from "@/lib/sigle";

const PAGE_SIZE = 15;

export default async function Page(params: {
  searchParams: Promise<{ page?: string }>;
}) {
  const searchParams = await params.searchParams;
  const page = Number.parseInt(searchParams.page || "1");
  const { data: posts } = await sigleApiFetchClient.GET("/api/posts/list", {
    params: {
      query: {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      },
    },
  });

  return (
    <div className="container">
      <h2 className="mt-6 text-2xl font-bold">Latest articles</h2>
      <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {posts?.results.map((post) => {
          return <PostCard key={post.id} post={post} />;
        })}
      </div>
      <Pagination
        page={page}
        total={posts?.total || 0}
        itemsPerPage={PAGE_SIZE}
      />
    </div>
  );
}
