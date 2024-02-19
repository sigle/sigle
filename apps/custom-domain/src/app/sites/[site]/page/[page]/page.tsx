import { Pagination } from '@/components/Pagination';
import { PostCard } from '@/components/PostCard';
import { getPosts } from '@/lib/api';

export const runtime = 'edge';
// Revalidate this page every 2 mins
export const revalidate = 120;

export default async function Page({
  params,
}: {
  params: { site: string; page: string };
}) {
  const { site } = params;

  const page = parseInt(params.page, 10);
  const posts = await getPosts({
    site,
    page,
  });

  return (
    <div className="container">
      <h2 className="mt-6 text-2xl font-bold">Latest articles</h2>
      <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {posts.posts.map((post) => {
          return <PostCard key={post.id} post={post} />;
        })}
      </div>
      <Pagination page={page} total={posts.count} itemsPerPage={15} />
    </div>
  );
}
