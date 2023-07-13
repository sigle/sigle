import ScrollUp from '@/components/ScrollUp';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPost, getSettings } from '@/lib/api';

export async function generateMetadata({
  params,
}: {
  params: { site: string; id: string };
}): Promise<Metadata> {
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
    openGraph: {
      title,
      description,
      url: `${settings.url}/posts/${id}`,
      type: 'website',
      siteName: settings.name,
      images: seoImage || settings.avatar,
    },
    twitter: {
      card: seoImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: seoImage || settings.avatar,
    },
  };
}

export default async function PostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { site: string };
}) {
  const { site } = params;
  const settings = await getSettings({ site });

  if (!settings) {
    notFound();
  }

  return (
    <>
      <ScrollUp />
      <main className="mt-5">{children}</main>
    </>
  );
}
