import { Footer } from "@/component/Layout/Footer";
import { sites } from "@/sites";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata | null> {
  const { domain } = await params;
  const site = sites[domain];
  if (!site) {
    notFound();
  }

  const title = `${site.name} | Blog`;
  const description = site.description;

  return {
    // metadataBase: new URL(site.url),
    title,
    description,
    icons: {
      icon: site.avatar,
    },
    openGraph: {
      title,
      description,
      url: site.url,
      type: "website",
      siteName: site.name,
      images: site.avatar,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: site.avatar,
    },
  };
}

export default async function PageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const site = sites[domain];
  if (!site) {
    notFound();
  }

  return (
    <>
      {children}
      <Footer />
    </>
  );
}
