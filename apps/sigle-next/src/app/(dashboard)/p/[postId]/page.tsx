import { sigleApiFetchclient } from '@/__generated__/sigle-api';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostClientPage } from './page-client';
import type { Routes } from '@/lib/routes';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<typeof Routes.post.params>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;

  const { data: post } = await sigleApiFetchclient.GET('/api/posts/{postId}', {
    params: {
      path: {
        postId: params.postId,
      },
    },
  });
  if (!post) {
    notFound();
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;

  return {
    title: `${title} | Sigle`,
    description,
  };
}

export default function Post(props: Props) {
  return <PostClientPage params={props.params} />;
}
