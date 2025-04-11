import type { paths } from "@/__generated__/sigle-api/openapi";
import { appConfig } from "@/config";
import { env } from "@/env";
import { useSession } from "@/lib/auth-hooks";
import { Routes } from "@/lib/routes";
import {
  Button,
  Callout,
  Dialog,
  IconButton,
  Link,
  TextField,
  VisuallyHidden,
} from "@radix-ui/themes";
import { IconReceiptTax } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";

interface PostShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: paths["/api/posts/list"]["get"]["responses"]["200"]["content"]["application/json"][0];
}

export const PostShareDialog = ({
  open,
  onOpenChange,
  post,
}: PostShareDialogProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { data: session } = useSession();
  // const session = null;
  const postLink = `${env.NEXT_PUBLIC_APP_URL}${Routes.post(
    { postId: post.id },
    {
      search: {
        referral: session ? session.user.id : undefined,
      },
    },
  )}`;

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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="3" className="max-w-md">
        <Dialog.Title>Share</Dialog.Title>
        <VisuallyHidden>
          <Dialog.Description>
            Earn referrer rewards for each primary sale made through your link.
          </Dialog.Description>
        </VisuallyHidden>

        <div className="space-y-8">
          <Callout.Root variant="surface" size="1" color="gray">
            <Callout.Icon>
              <IconReceiptTax size={16} />
            </Callout.Icon>
            <Callout.Text>
              Earn referrer rewards for each primary sale made through your
              link.{" "}
              <Link
                href={`${appConfig.docsUrl}/monetization#fee-structure`}
                target="_blank"
              >
                Learn more.
              </Link>
            </Callout.Text>
          </Callout.Root>

          <div className="flex justify-center gap-5">
            <IconButton size="4" color="gray" highContrast asChild>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Collect ${metaTitleAttribute} on @sigleapp&url=${postLink}`,
                )}`}
                target="_blank"
                rel="noreferrer noopener"
                className="overflow-hidden"
              >
                <Image
                  src="/images/x-logo.png"
                  alt="x logo"
                  width={48}
                  height={48}
                />
              </a>
            </IconButton>
            <IconButton size="4" color="gray" highContrast asChild>
              <a
                href={`https://bsky.app/intent/compose?text=${encodeURIComponent(
                  `Collect ${metaTitleAttribute} on @sigleapp`,
                )}&url=${postLink}`}
                target="_blank"
                rel="noreferrer noopener"
                className="overflow-hidden"
              >
                <Image
                  src="/images/bluesky-logo.png"
                  alt="bluesky logo"
                  width={48}
                  height={48}
                />
              </a>
            </IconButton>
            <IconButton size="4" color="gray" highContrast asChild>
              <a
                href={`https://t.me/share/url?text=${encodeURIComponent(
                  `Collect ${metaTitleAttribute} on @sigleapp`,
                )}&url=${postLink}`}
                target="_blank"
                rel="noreferrer noopener"
                className="overflow-hidden"
              >
                <Image
                  src="/images/telegram-logo.png"
                  alt="telegram logo"
                  width={48}
                  height={48}
                />
              </a>
            </IconButton>
          </div>

          <div className="flex gap-2">
            <TextField.Root
              size="3"
              className="grow"
              variant="soft"
              disabled={true}
              defaultValue={postLink}
            />
            <Button
              size="3"
              color="gray"
              highContrast
              disabled={isCopied}
              onClick={onCopy}
            >
              {isCopied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
