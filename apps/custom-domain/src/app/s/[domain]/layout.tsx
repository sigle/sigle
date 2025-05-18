import { Footer } from "@/components/Layout/Footer";
import { Header } from "@/components/Layout/Header";
import { resolveImageUrl } from "@/lib/images";
import { sigleApiFetchClient } from "@/lib/sigle";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata | null> {
  const { domain: domainUnsafe } = await params;
  const domain = decodeURIComponent(domainUnsafe);

  const { data: site } = await sigleApiFetchClient.GET("/api/sites/{domain}", {
    params: {
      path: {
        domain,
      },
    },
  });
  if (!site) {
    notFound();
  }

  const title = `${site.user.profile?.displayName} | Blog`;
  const description = site.user.profile?.description;
  const image = site.user.profile?.pictureUri
    ? resolveImageUrl(site.user.profile.pictureUri.id)
    : undefined;

  return {
    metadataBase: new URL(site.url),
    title,
    description,
    icons: {
      icon: image,
    },
    openGraph: {
      title,
      description,
      url: site.url,
      type: "website",
      siteName: site.user.profile?.displayName,
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
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain: domainUnsafe } = await params;
  const domain = decodeURIComponent(domainUnsafe);

  const { data: site } = await sigleApiFetchClient.GET("/api/sites/{domain}", {
    params: {
      path: {
        domain,
      },
    },
  });
  if (!site) {
    notFound();
  }

  return (
    <>
      <Header site={site} />
      {children}
      <Footer />
    </>
  );
}
