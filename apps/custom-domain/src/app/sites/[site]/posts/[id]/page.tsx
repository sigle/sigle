import { format } from 'date-fns';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PostCard } from '@/components/PostCard';
import { SubscribeFrame } from '@/components/SubscribeFrame';
import { TableOfContents } from '@/components/TableOfContents';
import { TwitterEmbed } from '@/components/TwitterEmbeds';
import { getPost, getPosts, getSettings, getSubscription } from '@/lib/api';
import { addIdsToHeadings } from '@/utils/addIdsToHeadings';
import { extractTableOfContents } from '@/utils/extractTableOfContents';

export const runtime = 'edge';
// Revalidate this page every 60 seconds
export const revalidate = 60;

export default async function Post({
  params,
}: {
  params: { site: string; id: string };
}) {
  const { site, id } = params;

  const settings = await getSettings({ site });
  const post = await getPost({
    site,
    id,
  });

  if (!post || !settings) {
    notFound();
  }

  const subscription = await getSubscription({ address: settings.address });

  // TODO change logic to get next and previous post
  let posts = await getPosts({ site, page: 1 });
  // Limit to 3 posts
  posts = {
    ...posts,
    posts: posts.posts.slice(0, 3),
  };

  const tableOfContent = extractTableOfContents(post.content);
  const posthtml = addIdsToHeadings(post.content);

  return (
    <div className="container">
      <div className="flex gap-2 text-[0.625rem] uppercase tracking-wide text-gray-500">
        <div>{format(new Date(post.createdAt), 'MMMM dd, yyyy')}</div>
        <div>·</div>
        <div>8 min read</div>
      </div>
      <h1 className="mt-2 text-4xl font-bold">{post.title}</h1>

      <div className="mt-9 grid grid-cols-1 gap-14 md:grid-cols-[280px,_1fr]">
        <div>
          <TableOfContents items={tableOfContent} post={post} />
        </div>
        <div>
          {post.coverImage && (
            <div className="relative mb-3 aspect-[45/28] overflow-hidden rounded-2xl">
              <Image
                className="object-cover"
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw,
                50vw"
              />
            </div>
          )}
          <div
            className="prose lg:prose-lg"
            dangerouslySetInnerHTML={{
              __html: posthtml,
            }}
          />

          <TwitterEmbed />

          {subscription?.newsletter && (
            <div className="mt-10">
              <h3 className="mb-2 text-center text-lg font-bold">
                Subscribe to the newsletter
              </h3>
              <SubscribeFrame settings={settings} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-2xl font-bold">Read more</h3>
        <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {posts.posts.map((post) => {
            return <PostCard key={post.id} post={post} />;
          })}
        </div>
      </div>
    </div>
  );
}
