import { Header } from '@/components/Header';
import { PostCard } from '@/components/PostCard';
import ScrollUp from '@/components/ScrollUp';
import { TableOfContents } from '@/components/TableOfContents';
import { SiteSettings } from '@/types';
import { addIdsToHeadings } from '@/utils/addIdsToHeadings';
import { extractTableOfContents } from '@/utils/extractTableOfContents';
import { getAbsoluteUrl } from '@/utils/vercel';
import { format } from 'date-fns';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export const runtime = 'edge';
// Revalidate this page every 60 seconds
export const revalidate = 60;

async function getSettings({
  site,
}: {
  site: string;
}): Promise<SiteSettings | null> {
  const res = await fetch(`${getAbsoluteUrl()}/api/settings?site=${site}`);
  return res.json();
}

async function getPost({ site, id }: { site: string; id: string }): Promise<{
  id: string;
  coverImage?: string;
  title: string;
  content: string;
  createdAt: number;
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
}> {
  const res = await fetch(`${getAbsoluteUrl()}/api/posts/${id}?site=${site}`);
  return res.json();
}

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

export async function generateMetadata({
  params,
}: {
  params: { site: string; id: string };
}) {
  const { site, id } = params;
  const settings = await getSettings({ site });
  const post = await getPost({
    site,
    id: id,
  });

  if (!settings || !post) {
    notFound();
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription;
  const seoImage = post.metaImage || post.coverImage;

  return {
    title,
    description,
    icons: {
      icon: settings.avatar,
    },
    twitter: {
      card: seoImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: [seoImage || settings.avatar],
    },
  };
}

export default async function Post({
  params,
}: {
  params: { site: string; id: string };
}) {
  const { site, id } = params;
  const settings = await getSettings({ site });

  if (!settings) {
    notFound();
  }

  const post = await getPost({
    site,
    id,
  });

  if (!post) {
    notFound();
  }

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
    <>
      <ScrollUp />
      <Header settings={settings} />
      <main className="mt-5 mb-16">
        <div className="container">
          <div className="text-[0.625rem] text-gray-500 uppercase tracking-wide flex gap-2">
            <div>{format(new Date(post.createdAt), 'MMMM dd, yyyy')}</div>
            <div>·</div>
            <div>8 min read</div>
          </div>
          <h1 className="mt-2 font-bold text-4xl">{post.title}</h1>

          <div className="mt-9 gap-14 grid m grid-cols-1 md:grid-cols-[280px,_1fr]">
            <div>
              <TableOfContents items={tableOfContent} post={post} />
            </div>
            <div>
              {post.coverImage && (
                <div className="mb-3 relative aspect-[45/28] overflow-hidden rounded rounded-2xl">
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
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-2xl	font-bold">Read more</h3>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
              {posts.posts.map((post) => {
                return <PostCard key={post.id} post={post} />;
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
