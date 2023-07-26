import { getServerSideSitemap } from 'next-sitemap';

// Can't use edge runtime because of https://github.com/vercel/next.js/issues/46492
// export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { site: string } },
) {
  const { site } = params;
  const { origin } = new URL(request.url);

  const res = await fetch(`${origin}/api/posts?site=${site}`);
  const posts: {
    posts: {
      id: string;
      coverImage?: string;
      title: string;
      content: string;
      createdAt: number;
      updatedAt?: number;
    }[];
  } = await res.json();

  return getServerSideSitemap([
    // Static pages
    {
      loc: origin,
      lastmod: new Date().toISOString(),
    },

    // Post dynamic pages
    ...posts.posts.map((post) => ({
      loc: `${origin}/posts/${post.id}`,
      lastmod: new Date(post.updatedAt || post.createdAt).toISOString(),
      images: post.coverImage ? [{ loc: new URL(post.coverImage) }] : [],
    })),
  ]);
}
