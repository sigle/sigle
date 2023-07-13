import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSettings } from '@/lib/api';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export async function generateMetadata({
  params,
}: {
  params: { site: string };
}): Promise<Metadata | null> {
  const { site } = params;
  const settings = await getSettings({ site });
  if (!settings) {
    return null;
  }

  const title = `${settings.name} | Blog`;
  const description = settings.description;

  return {
    metadataBase: new URL(settings.url),
    title,
    description,
    icons: {
      icon: settings.avatar,
    },
    openGraph: {
      title,
      description,
      url: settings.url,
      type: 'website',
      siteName: settings.name,
      images: settings.avatar,
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: settings.avatar,
    },
  };
}

export default async function SiteLayout({
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
      <Header settings={settings} />
      {children}
      <Footer />
    </>
  );
}
