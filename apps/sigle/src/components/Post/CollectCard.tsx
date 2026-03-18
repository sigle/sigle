import { Button, Progress } from "@radix-ui/themes";
import { type paths, formatBTC } from "@sigle/sdk";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { PostCollectDialog } from "../Shared/Post/PostCollectDialog";

interface PostCollectCardProps {
  post: paths["/api/posts/{postId}"]["get"]["responses"]["200"]["content"]["application/json"];
}

export const PostCollectCard = ({ post }: PostCollectCardProps) => {
  const [collectDialogOpen, setCollectDialogOpen] = useState(false);

  if (!post.minterFixedPrice || !post.collectible) {
    return null;
  }

  const mintPercentage =
    post.collectible.maxSupply > 0
      ? (post.collectible.collected / post.collectible.maxSupply) * 100
      : 0;
  const canCollect =
    post.collectible.maxSupply === 0 ||
    post.collectible.collected < post.collectible.maxSupply;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-xl font-medium">
              {canCollect ? "Collect this post" : "Collect ended"}
            </h4>
            {canCollect ? (
              <p className="text-sm text-muted-foreground">
                {post.collectible.collected > 0
                  ? `Join ${post.collectorsCount} collectors`
                  : "Be the first to collect this post"}
              </p>
            ) : null}
          </div>
          <div className="space-y-1 text-right">
            <p
              className={cn(
                post.minterFixedPrice.price === "0" ? "text-base" : "text-lg",
                "font-medium",
              )}
            >
              {post.minterFixedPrice.price === "0"
                ? "Free"
                : `${formatBTC(BigInt(post.minterFixedPrice.price))} sBTC`}
            </p>
            <p className="text-sm text-muted-foreground">
              {post.collectible.openEdition
                ? "Open edition"
                : "Limited edition"}
            </p>
          </div>
        </div>
        {!post.collectible.openEdition ? (
          <Progress
            variant="soft"
            color="gray"
            highContrast
            size="3"
            value={mintPercentage}
          />
        ) : null}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {post.collectible.openEdition
              ? `${post.collectible.collected} collected`
              : `${post.collectible.collected}/${post.collectible.maxSupply} collected`}
          </p>
        </div>
        <Button
          className="w-full"
          size="3"
          disabled={!canCollect}
          onClick={() => setCollectDialogOpen(true)}
        >
          Collect
        </Button>
      </div>

      <PostCollectDialog
        post={post}
        open={collectDialogOpen}
        onOpenChange={setCollectDialogOpen}
      />
    </>
  );
};
