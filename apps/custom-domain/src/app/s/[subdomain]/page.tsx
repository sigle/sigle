import { PostCard } from "@/component/Shared/Post";
import { sigleApiFetchclient } from "@/lib/sigle";

export default async function Page() {
  const { data: posts } = await sigleApiFetchclient.GET("/api/posts/list", {
    params: {
      query: {
        limit: 20,
      },
    },
  });

  return (
    <div className="container">
      <h2 className="mt-6 text-2xl font-bold">Latest articles</h2>
      <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {posts?.map((post) => {
          return <PostCard key={post.id} post={post} />;
        })}
      </div>
      {/* <Pagination page={page} total={posts.count} itemsPerPage={15} /> */}
    </div>
  );
}
