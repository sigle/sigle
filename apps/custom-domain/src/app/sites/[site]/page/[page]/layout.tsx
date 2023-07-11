import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import ScrollUp from '@/components/ScrollUp';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getSettings, getSubscription } from '@/lib/api';
import { Footer } from '@/components/Footer';

export async function generateMetadata({
  params,
}: {
  params: { site: string };
}): Promise<Metadata> {
  const { site } = params;
  const settings = await getSettings({ site });

  if (!settings) {
    notFound();
  }

  const title = `${settings.name} | Blog`;
  const description = settings.description;

  return {
    // metadataBase: new URL(settings.url),
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

export default async function PageLayout({
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

  const subscription = await getSubscription({ address: settings.address });

  return (
    <>
      <ScrollUp />
      <Header settings={settings} />
      <main>
        <Hero settings={settings} newsletter={subscription?.newsletter} />
        {children}
      </main>
      <Footer />
    </>
  );
}
