import { Button, Heading, Text } from "@radix-ui/themes";
import { useState } from "react";
import { PostShareDialog } from "../Shared/Post/PostShareDialog";
import type { paths } from "@/__generated__/sigle-api/openapi";

interface PostShareCardProps {
  post: paths["/api/posts/list"]["get"]["responses"]["200"]["content"]["application/json"][0];
}

export const PostShareCard = ({ post }: PostShareCardProps) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1 text-center md:text-left">
          <Heading as="h4" size="3" weight="medium">
            Share & Earn
          </Heading>
          <Text as="p" color="gray" size="2">
            Share this post and earn STX.
          </Text>
        </div>
        <div className="flex space-x-4">
          <Button
            className="flex-1"
            variant="outline"
            color="gray"
            highContrast
            onClick={() => setShareDialogOpen(true)}
          >
            Share
          </Button>
        </div>
      </div>

      <PostShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        post={post}
      />
    </>
  );
};
