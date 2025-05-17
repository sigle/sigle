import { Footer } from "@/component/Layout/Footer";
import { resolveImageUrl } from "@/lib/images";
import { sigleApiFetchClient } from "@/lib/sigle";
import { sites } from "@/sites";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata | null> {
  const { domain: domainUnsafe } = await params;
  const domain = decodeURIComponent(domainUnsafe);
  const site = sites[domain];
  if (!site) {
    notFound();
  }

  const { data: user } = await sigleApiFetchClient.GET(
    "/api/users/{username}",
    {
      params: {
        path: {
          username: site.address,
        },
      },
    },
  );
  if (!user) {
    notFound();
  }

  const url = `https://${domain}`;
  const title = `${user.profile?.displayName} | Blog`;
  const description = user.profile?.description;
  const image = user.profile?.pictureUri
    ? resolveImageUrl(user.profile.pictureUri.id)
    : undefined;

  return {
    metadataBase: new URL(url),
    title,
    description,
    icons: {
      icon: image,
    },
    openGraph: {
      title,
      description,
      url: url,
      type: "website",
      siteName: user.profile?.displayName,
      images: image,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: image,
    },
  };
}

export default async function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
