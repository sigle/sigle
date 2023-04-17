import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import ScrollUp from '@/components/ScrollUp';
import { SiteSettings } from '@/types';
import { getAbsoluteUrl } from '@/utils/vercel';
import { notFound } from 'next/navigation';

async function getSettings({
  site,
}: {
  site: string;
}): Promise<SiteSettings | null> {
  const res = await fetch(`${getAbsoluteUrl()}/api/settings?site=${site}`);
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

  return (
    <>
      <ScrollUp />
      <Header settings={settings} />
      <main className="mb-16">
        <Hero settings={settings} />
        {children}
      </main>
    </>
  );
}
