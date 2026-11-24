"use client";

import { IconExternalLink } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { env } from "@/env";
import { sigleApiClient } from "@/lib/sigle";

/** Where a published story is archived on Arweave. */
export const arweaveStoryUrl = (arweaveTxId: string) =>
  `${env.NEXT_PUBLIC_ARWEAVE_GATEWAY_URL}/${arweaveTxId}`;

interface PostVisibilityOptions {
  /** Called once a post is hidden, or shown again, with its new state. */
  readonly onChange?: (postId: string, hidden: boolean) => void;
}

/**
 * Hides a post of the signed-in user from Sigle, or shows it again. Hiding
 * shows a toast to undo it. Resolves to whether the change was saved.
 */
export const usePostVisibility = ({ onChange }: PostVisibilityOptions = {}) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = sigleApiClient.useMutation(
    "put",
    "/api/me/posts/{postId}/visibility",
    {
      onError: (error: { message: string }) => {
        toast.error("Failed to update the story", {
          description: error.message,
        });
      },
    },
  );

  const setHidden = (postId: string, hidden: boolean): Promise<boolean> =>
    mutateAsync({ params: { path: { postId } }, body: { hidden } }).then(
      async () => {
        onChange?.(postId, hidden);
        await queryClient.invalidateQueries({
          queryKey: ["get", "/api/me/posts"],
        });

        if (hidden) {
          toast("Story hidden", {
            description: "It's still archived on Arweave.",
            // Longer than the default, to leave time to undo.
            duration: 10_000,
            action: {
              label: "Undo",
              onClick: () => setHidden(postId, false),
            },
          });
        } else {
          toast("Story shown on your blog");
        }

        return true;
      },
      () => false,
    );

  return { setHidden, isPending };
};

interface HidePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: {
    readonly id: string;
    readonly title: string;
    readonly metaTitle: string | null;
    readonly arweaveTxId: string;
  };
  onChange?: PostVisibilityOptions["onChange"];
}

export const HidePostDialog = ({
  open,
  onOpenChange,
  post,
  onChange,
}: HidePostDialogProps) => {
  const { setHidden, isPending } = usePostVisibility({ onChange });

  const onHide = async () => {
    if (await setHidden(post.id, true)) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="headline text-2xl leading-tight">
            Hide this story?
          </DialogTitle>
          <DialogDescription className="line-clamp-2">
            {post.metaTitle || post.title}
          </DialogDescription>
        </DialogHeader>

        <dl className="border-t border-border text-sm">
          <div className="border-b border-border py-3">
            <dt className="font-mono text-xs text-muted-foreground uppercase">
              What changes
            </dt>
            <dd className="mt-1 text-pretty">
              The story leaves your profile and RSS feed, and its Sigle link
              shows “not found”. It can take a minute to disappear everywhere.
            </dd>
          </div>
          <div className="border-b border-border py-3">
            <dt className="font-mono text-xs text-muted-foreground uppercase">
              What stays
            </dt>
            <dd className="mt-1 text-pretty">
              It&apos;s still archived on{" "}
              <a
                href={arweaveStoryUrl(post.arweaveTxId)}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-0.5 underline underline-offset-4"
              >
                Arweave
                <IconExternalLink size={12} />
              </a>{" "}
              and its Bitcoin timestamp stays valid. You can show it again
              anytime from Dashboard › Published.
            </dd>
          </div>
        </dl>

        <DialogFooter>
          <DialogClose
            render={
              <Button variant="outline" disabled={isPending}>
                Cancel
              </Button>
            }
          />
          <Button loading={isPending} onClick={onHide}>
            Hide story
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
