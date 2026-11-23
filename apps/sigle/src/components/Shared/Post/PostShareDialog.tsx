import type { paths } from "@sigle/sdk";
import {
  IconBrandBluesky,
  IconBrandTelegram,
  IconBrandX,
  IconCheck,
  IconCopy,
} from "@tabler/icons-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { env } from "@/env";
import { Routes } from "@/lib/routes";

interface PostShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Pick<
    paths["/api/posts"]["get"]["responses"][200]["content"]["application/json"]["results"][number],
    "id" | "title" | "metaTitle"
  >;
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

  const title = post.metaTitle || post.title;
  const text = `Read “${title}” on Sigle`;

  const networks = [
    {
      name: "X",
      icon: IconBrandX,
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(
        `Read “${title}” on @sigleapp`,
      )}&url=${encodeURIComponent(postLink)}`,
    },
    {
      name: "Bluesky",
      icon: IconBrandBluesky,
      // Bluesky only reads the text, so the link goes in it.
      href: `https://bsky.app/intent/compose?text=${encodeURIComponent(
        `${text} ${postLink}`,
      )}`,
    },
    {
      name: "Telegram",
      icon: IconBrandTelegram,
      href: `https://t.me/share/url?url=${encodeURIComponent(
        postLink,
      )}&text=${encodeURIComponent(text)}`,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="headline text-2xl leading-tight">
            Share this story
          </DialogTitle>
          <DialogDescription className="line-clamp-2">
            {title}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border py-1 pr-1 pl-3">
          <p className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
            {postLink}
          </p>
          <Button size="sm" variant="ghost" onClick={onCopy}>
            {isCopied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            {isCopied ? "Copied" : "Copy link"}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {networks.map((network) => (
            <a
              key={network.name}
              href={network.href}
              target="_blank"
              rel="noreferrer noopener"
              className={buttonVariants({ variant: "outline" })}
            >
              <network.icon size={16} />
              {network.name}
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
