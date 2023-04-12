import { FeaturedPostCard } from '@/components/FeaturedPostCard';
import { Pagination } from '@/components/Pagination';
import { PostCard } from '@/components/PostCard';
import { getAbsoluteUrl } from '@/utils/vercel';

export const runtime = 'edge';
// Revalidate this page every 60 seconds
export const revalidate = 60;

async function getPosts({
  site,
  page,
}: {
  site: string;
  page: number;
}): Promise<{
  count: number;
  posts: {
    id: string;
    coverImage?: string;
    title: string;
    content: string;
    createdAt: number;
  }[];
}> {
  const res = await fetch(
    `${getAbsoluteUrl()}/api/posts?site=${site}&page=${page}`
  );
  return res.json();
}

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
      <h2 className="mt-10 text-2xl font-bold">Latest article</h2>
      <FeaturedPostCard post={posts.posts[0]} />
      <h2 className="mt-10 text-2xl font-bold">Read more</h2>
      <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {posts.posts.map((post) => {
          return <PostCard key={post.id} post={post} />;
        })}
      </div>
      <Pagination page={page} total={posts.count} itemsPerPage={15} />
    </div>
  );
}
