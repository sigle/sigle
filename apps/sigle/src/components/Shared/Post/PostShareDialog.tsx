import type { paths } from "@sigle/sdk";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { env } from "@/env";
import { Routes } from "@/lib/routes";

interface PostShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: paths["/api/posts/list"]["get"]["responses"]["200"]["content"]["application/json"]["results"][number];
}

export const PostShareDialog = ({
  open,
  onOpenChange,
  post,
}: PostShareDialogProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const postLink = `${env.NEXT_PUBLIC_APP_URL}${Routes.post({
    postId: post.id,
  })}`;

  const onCopy = () => {
    navigator.clipboard.writeText(postLink).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };

  const metaTitleAttribute = post.metaTitle || post.title;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Share</DialogTitle>
        <div className="sr-only">
          <DialogDescription>Share this post.</DialogDescription>
        </div>

        <div className="space-y-8">
          <div className="flex justify-center gap-5">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `Read ${metaTitleAttribute} on @sigleapp&url=${postLink}`,
              )}`}
              target="_blank"
              rel="noreferrer noopener"
              className="overflow-hidden rounded-md hover:grayscale-25"
            >
              <Image
                src="/images/x-logo.png"
                alt="x logo"
                width={48}
                height={48}
              />
            </a>
            <a
              href={`https://bsky.app/intent/compose?text=${encodeURIComponent(
                `Read ${metaTitleAttribute} on @sigleapp`,
              )}&url=${postLink}`}
              target="_blank"
              rel="noreferrer noopener"
              className="overflow-hidden rounded-md hover:grayscale-25"
            >
              <Image
                src="/images/bluesky-logo.png"
                alt="bluesky logo"
                width={48}
                height={48}
              />
            </a>
            <a
              href={`https://t.me/share/url?text=${encodeURIComponent(
                `Read ${metaTitleAttribute} on @sigleapp`,
              )}&url=${postLink}`}
              target="_blank"
              rel="noreferrer noopener"
              className="overflow-hidden rounded-md hover:grayscale-25"
            >
              <Image
                src="/images/telegram-logo.png"
                alt="telegram logo"
                width={48}
                height={48}
              />
            </a>
          </div>

          <Field orientation="horizontal">
            <Input
              className="disabled:opacity-100"
              disabled
              defaultValue={postLink}
            />
            <Button disabled={isCopied} onClick={onCopy}>
              {isCopied ? "Copied" : "Copy"}
            </Button>
          </Field>
        </div>
      </DialogContent>
    </Dialog>
  );
};
