import { Button, Heading, Progress, Text } from "@radix-ui/themes";
import { type paths, formatBTC } from "@sigle/sdk";
import { useState } from "react";
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
            <Heading as="h4" size="3" weight="medium">
              {canCollect ? "Collect this post" : "Collect ended"}
            </Heading>
            {canCollect ? (
              <Text as="p" color="gray" size="2">
                {post.collectible.collected > 0
                  ? `Join ${post.collectorsCount} collectors`
                  : "Be the first to collect this post"}
              </Text>
            ) : null}
          </div>
          <div className="space-y-1 text-right">
            <Text
              as="p"
              size={post.minterFixedPrice.price === "0" ? "3" : "4"}
              weight="medium"
            >
              {post.minterFixedPrice.price === "0"
                ? "Free"
                : `${formatBTC(BigInt(post.minterFixedPrice.price))} sBTC`}
            </Text>
            <Text as="p" color="gray" size="2">
              {post.collectible.openEdition
                ? "Open edition"
                : "Limited edition"}
            </Text>
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
          <Text as="p" color="gray" size="2">
            {post.collectible.openEdition
              ? `${post.collectible.collected} collected`
              : `${post.collectible.collected}/${post.collectible.maxSupply} collected`}
          </Text>
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
