import { resolveImageUrl } from "@/lib/images";
import { sigleApiFetchClient } from "@/lib/sigle";
import { sites } from "@/sites";
import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function sitemap() {
  // next.js sitemap function doesn't pass the params, so we use headers as a workaround
  const headersList = await headers();
  const domain = headersList.get("host") || "";
  const site = sites[domain];
  const { origin } = new URL(`https://${domain}`);

  const { data: posts } = await sigleApiFetchClient.GET("/api/posts/list", {
    params: {
      query: {
        limit: 100,
        username: site.address,
      },
    },
  });

  const sitemap: MetadataRoute.Sitemap = [
    // Static pages
    {
      url: origin,
      lastModified: new Date().toISOString(),
    },

    // Post dynamic pages
    ...(posts?.results.map((post) => ({
      url: `${origin}/posts/${post.id}`,
      lastModified: new Date(post.updatedAt).toISOString(),
      images: post.coverImage ? [resolveImageUrl(post.coverImage.id)] : [],
    })) || []),
  ];

  return sitemap;
}
