"use client";

import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { AuthProtect } from "@/components/Auth/AuthProtect";
import { NextLink } from "@/components/Shared/NextLink";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { sigleApiClient } from "@/lib/sigle";
import { getExplorerTransactionUrl } from "@/lib/stacks";

interface PostDeployPendingProps {
  params: Promise<{ postId: string }>;
}

export default function PostDeployPending(props: PostDeployPendingProps) {
  const params = use(props.params);
  const router = useRouter();

  const {
    data: post,
    isLoading: isPostLoading,
    error,
  } = sigleApiClient.useQuery(
    "get",
    "/api/protected/drafts/{draftId}",
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
      <div className="mx-auto max-w-4xl px-4">
        {post?.txId && post.txStatus === "rejected" ? (
          <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-2 py-[200px]">
            <p className="text-sm text-destructive">
              Something went wrong and your transaction was rejected.
            </p>
            <a
              className="text-sm text-muted-foreground hover:underline"
              href={getExplorerTransactionUrl(post.txId)}
              target="_blank"
              rel="noreferrer"
            >
              View transaction on explorer.
            </a>
          </div>
        ) : null}
        {post?.txId && post.txStatus === "pending" ? (
          <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-2 py-[200px]">
            <div className="mb-2">
              <Spinner />
            </div>
            <p className="text-sm">Your post is being published...</p>
            <p className="text-center text-sm text-muted-foreground">
              Your post has been submitted to the blockchain.
              <br />
              It may take up to 15 minutes for the transaction to succeed.
            </p>
            <p className="text-center text-sm text-muted-foreground">
              You&apos;ll be redirected once the transaction is complete. Feel
              free to navigate away - your post will still be published after
              confirmation.
            </p>
            <a
              className="text-sm text-muted-foreground hover:underline"
              href={getExplorerTransactionUrl(post.txId)}
              target="_blank"
              rel="noreferrer"
            >
              View transaction on explorer.
            </a>
            <Button
              variant="secondary"
              className="mt-5"
              nativeButton={false}
              render={<NextLink href="/" />}
            >
              Explore content on Sigle
            </Button>
          </div>
        ) : null}
      </div>
    </AuthProtect>
  );
}
