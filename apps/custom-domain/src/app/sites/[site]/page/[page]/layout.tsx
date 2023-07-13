import { Hero } from '@/components/Hero';
import ScrollUp from '@/components/ScrollUp';
import { notFound } from 'next/navigation';
import { getSettings, getSubscription } from '@/lib/api';

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
      <main>
        <Hero settings={settings} newsletter={subscription?.newsletter} />
        {children}
      </main>
    </>
  );
}
