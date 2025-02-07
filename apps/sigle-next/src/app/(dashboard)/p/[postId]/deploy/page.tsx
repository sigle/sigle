'use client';

import { sigleApiClient } from '@/__generated__/sigle-api';
import { AuthProtect } from '@/components/Auth/AuthProtect';
import { NextLink } from '@/components/Shared/NextLink';
import { getExplorerTransactionUrl } from '@/lib/stacks';
import { Container, Spinner, Text, Link, Button } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';

type PostDeployPendingProps = {
  params: Promise<{ postId: string }>;
};

export default function PostDeployPending(props: PostDeployPendingProps) {
  const params = use(props.params);
  const router = useRouter();

  const {
    data: post,
    isLoading: isPostLoading,
    error,
  } = sigleApiClient.useQuery(
    'get',
    '/api/protected/drafts/{draftId}',
    {
      params: {
        path: {
          draftId: params.postId,
        },
      },
    },
    {
      refetchInterval: 2000,
      refetchIntervalInBackground: true,
    },
  );

  // We wait for the post to be deleted before redirecting to the post page
  // Deleted means that the post has been indexed so we check for the 404 status
  useEffect(() => {
    if (!isPostLoading && error?.statusCode === 404) {
      router.push(`/p/${params.postId}?published=true`);
    }
  }, [isPostLoading, params.postId, router, error]);

  return (
    <AuthProtect>
      <Container px="4">
        {post?.txId && post.txStatus === 'rejected' ? (
          <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-2 py-[200px]">
            <Text as="div" size="2" color="red">
              Something went wrong and your transaction was rejected.
            </Text>
            <Link
              size="2"
              href={getExplorerTransactionUrl(post.txId)}
              target="_blank"
            >
              View transaction on explorer.
            </Link>
          </div>
        ) : null}
        {post?.txId && post.txStatus === 'pending' ? (
          <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-2 py-[200px]">
            <div className="mb-2">
              <Spinner />
            </div>
            <Text as="div" size="2">
              Your post is being published...
            </Text>
            <Text align="center" color="gray" size="2">
              Your post has been submitted to the blockchain.
              <br />
              It may take up to 15 minutes for the transaction to succeed.
            </Text>
            <Text align="center" color="gray" size="2">
              You'll be redirected once the transaction is complete. Feel free
              to navigate away - your post will still be published after
              confirmation.
            </Text>
            <Link
              size="2"
              href={getExplorerTransactionUrl(post.txId)}
              target="_blank"
            >
              View transaction on explorer.
            </Link>
            <Button color="gray" highContrast variant="soft" size="2" asChild>
              <NextLink className="!mt-5" href="/">
                Explore content on Sigle
              </NextLink>
            </Button>
          </div>
        ) : null}
      </Container>
    </AuthProtect>
  );
}
