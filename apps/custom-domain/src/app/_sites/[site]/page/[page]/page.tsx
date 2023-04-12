import { Hero } from '@/components/Hero';
import { Pagination } from '@/components/Pagination';
import { PostCard } from '@/components/PostCard';
import { Header } from '@/components/Header';
import ScrollUp from '@/components/ScrollUp';
import { getAbsoluteUrl } from '@/utils/vercel';
import { notFound } from 'next/navigation';
import { SiteSettings } from '@/types';

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
  params: { site: string };
}) {
  const { site } = params;
  const settings = await getSettings({ site });

  if (!settings) {
    notFound();
  }

  const title = `${settings.name} | Blog`;
  const description = settings.description;

  return {
    title,
    description,
    icons: {
      icon: settings.avatar,
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [settings.avatar],
    },
  };
}

export default async function Home({
  params,
}: {
  params: { site: string; page: string };
}) {
  const { site } = params;
  const settings = await getSettings({ site });

  if (!settings) {
    notFound();
  }

  const page = parseInt(params.page, 10);
  const posts = await getPosts({
    site,
    page,
  });

  return (
    <>
      <ScrollUp />
      <Header settings={settings} />
      <main className="mb-16">
        <Hero settings={settings} />
        <div className="container">
          <h2 className="mt-6 text-2xl font-bold">Latest articles</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            {posts.posts.map((post) => {
              return <PostCard key={post.id} post={post} />;
            })}
          </div>
          <Pagination page={page} total={posts.count} itemsPerPage={15} />
        </div>
      </main>
    </>
  );
}
