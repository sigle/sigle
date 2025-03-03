import type { paths } from "@/__generated__/sigle-api/openapi";
import { Button, Heading, Progress, Text } from "@radix-ui/themes";
import { formatBTC } from "@sigle/sdk";
import { useState } from "react";
import { PostCollectDialog } from "../Shared/Post/PostCollectDialog";

interface PostCollectCardProps {
  post: paths["/api/posts/{postId}"]["get"]["responses"]["200"]["content"]["application/json"];
}

export const PostCollectCard = ({ post }: PostCollectCardProps) => {
  const [collectDialogOpen, setCollectDialogOpen] = useState(false);
  const mintPercentage =
    post.maxSupply > 0 ? (post.collected / post.maxSupply) * 100 : 0;
  const canCollect = post.maxSupply === 0 || post.collected < post.maxSupply;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Heading as="h4" size="3" weight="medium">
              Collect this post
            </Heading>
            <Text as="p" color="gray" size="2">
              {post.collected > 0
                ? // TODO collectors amount is not accurate
                  `Join ${post.collected} collectors`
                : "Be the first to collect this post"}
            </Text>
          </div>
          <div className="space-y-1 text-right">
            <Text as="p" size={post.price === "0" ? "3" : "4"} weight="medium">
              {post.price === "0"
                ? "Free"
                : `${formatBTC(BigInt(post.price))} sBTC`}
            </Text>
            <Text as="p" color="gray" size="2">
              {post.openEdition ? "Open edition" : "Limited edition"}
            </Text>
          </div>
        </div>
        {!post.openEdition ? (
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
            {post.openEdition
              ? `${post.collected} collected`
              : `${post.collected}/${post.maxSupply} collected`}
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
