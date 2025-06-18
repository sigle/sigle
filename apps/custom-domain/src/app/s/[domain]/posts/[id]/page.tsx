import { format } from "date-fns";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TableOfContents } from "@/components/Post/TableOfContents";
import { TwitterEmbed } from "@/components/Post/TwitterEmbeds";
import { PostCard } from "@/components/Shared/Post/Card";
import { resolveImageUrl } from "@/lib/images";
import { addIdsToHeadings, extractTableOfContents } from "@/lib/posts";
import { sigleApiFetchClient } from "@/lib/sigle";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; id: string }>;
}): Promise<Metadata> {
  const { domain: domainUnsafe, id } = await params;
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

  const { data: post } = await sigleApiFetchClient.GET("/api/posts/{postId}", {
    params: {
      path: {
        postId: id,
      },
    },
  });
  if (!post || post.user.id !== site.user.id) {
    notFound();
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription;
  const seoImage = post.coverImage
    ? resolveImageUrl(post.coverImage.id)
    : site.user.profile?.pictureUri
      ? resolveImageUrl(site.user.profile.pictureUri.id)
      : undefined;

  return {
    title,
    description,
    icons: {
      icon: site.user.profile?.pictureUri
        ? resolveImageUrl(site.user.profile.pictureUri.id)
        : undefined,
    },
    openGraph: {
      title,
      description,
      url: `${site.url}/posts/${id}`,
      type: "website",
      siteName: site.user.profile?.displayName,
      images: seoImage,
    },
    twitter: {
      card: seoImage ? "summary_large_image" : "summary",
      title,
      description,
      images: seoImage,
    },
  };
}

export default async function Post({
  params,
}: {
  params: Promise<{ domain: string; id: string }>;
}) {
  const { domain: domainUnsafe, id } = await params;
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

  const { data: post } = await sigleApiFetchClient.GET("/api/posts/{postId}", {
    params: {
      path: {
        postId: id,
      },
    },
  });
  if (!post || post.user.id !== site.user.id) {
    notFound();
  }

  const { data: posts } = await sigleApiFetchClient.GET("/api/posts/list", {
    params: {
      query: {
        username: site.user.id,
        limit: 4,
      },
    },
  });

  const tableOfContent = post.content
    ? extractTableOfContents(post.content)
    : [];
  const posthtml = post.content ? addIdsToHeadings(post.content) : "";

  const filteredPosts =
    posts?.results.filter((p) => p.id !== post.id).slice(0, 3) || [];

  return (
    <main className="mt-10">
      <div className="container">
        <div className="flex gap-2 text-[0.625rem] tracking-wide text-gray-500 uppercase">
          <div>{format(new Date(post.createdAt), "MMMM dd, yyyy")}</div>
          <div>·</div>
          <div>8 min read</div>
        </div>
        <h1 className="mt-2 text-4xl font-bold">{post.title}</h1>

        <div className="mt-9 grid grid-cols-1 gap-14 md:grid-cols-[280px,_1fr]">
          <div>
            <TableOfContents items={tableOfContent} post={post} />
          </div>
          <div>
            {post.coverImage && (
              <div className="relative mb-3 aspect-[45/28] overflow-hidden rounded-2xl">
                <Image
                  className="object-cover"
                  src={resolveImageUrl(post.coverImage.id)}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw,
                50vw"
                />
              </div>
            )}
            <div
              className="prose lg:prose-lg"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: it's safe to use this as the html is sanitized
              dangerouslySetInnerHTML={{
                __html: posthtml,
              }}
            />

            <TwitterEmbed />
          </div>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="mt-10">
            <h3 className="text-2xl font-bold">Read more</h3>
            <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => {
                return <PostCard key={post.id} post={post} />;
              })}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
