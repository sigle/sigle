import type { paths } from "@sigle/sdk";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PostShareDialog } from "../Shared/Post/PostShareDialog";

interface PostShareCardProps {
  post: paths["/api/posts/list"]["get"]["responses"]["200"]["content"]["application/json"]["results"][number];
}

export const PostShareCard = ({ post }: PostShareCardProps) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-xl font-medium">Share & Earn</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            Share this post and earn sBTC.
          </p>
        </div>
        <div className="flex space-x-4">
          <Button
            className="flex-1"
            variant="outline"
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
