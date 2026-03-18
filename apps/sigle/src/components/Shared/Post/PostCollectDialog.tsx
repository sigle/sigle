"use client";

import {
  Button,
  Dialog,
  Heading,
  IconButton,
  Separator,
  Skeleton,
  Tooltip,
  VisuallyHidden,
} from "@radix-ui/themes";
import { type paths, fixedMintFee, formatBTC } from "@sigle/sdk";
import {
  IconHelpCircle,
  IconInfoCircle,
  IconMinus,
  IconPlus,
} from "@tabler/icons-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { appConfig } from "@/config";
import { useContractCall } from "@/hooks/useContractCall";
import {
  formatUSDollar,
  useCurrencyFiatPrice,
} from "@/hooks/useCurrencyFiatPrice";
import { useStacksLogin } from "@/hooks/useStacksLogin";
import { useSession } from "@/lib/auth-hooks";
import { cn } from "@/lib/cn";
import { resolveImageUrl } from "@/lib/images";
import { sigleClient } from "@/lib/sigle";
import {
  formatReadableAddress,
  getExplorerTransactionUrl,
  getPromiseTransactionConfirmation,
} from "@/lib/stacks";
import { ProfileAvatar } from "../Profile/ProfileAvatar";

interface PostCollectDialogProps {
  post: paths["/api/posts/list"]["get"]["responses"]["200"]["content"]["application/json"]["results"][number];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PostCollectDialog = ({
  post,
  open,
  onOpenChange,
}: PostCollectDialogProps) => {
  const searchParams = useSearchParams();
  const referral = searchParams.get("referral");
  const { data: session } = useSession();
  const { login } = useStacksLogin();
  const { data: currencyFiatPrice, isLoading: loadingCurrencyFiatPrice } =
    useCurrencyFiatPrice(
      // We wait for the dialog to be open to fetch the price
      open ? "sBTC" : undefined,
    );
  const [editions, setEditions] = useState(1);
  const isPostOwner = session?.user.id === post.user.id;

  const { contractCall, loading: contractLoading } = useContractCall({
    onSuccess: (data) => {
      toast.promise(getPromiseTransactionConfirmation(data.txId), {
        loading: "Collect transaction submitted",
        success: "Collected successfully",
        error: "Transaction failed",
        action: {
          label: "View tx",
          onClick: () =>
            window.open(getExplorerTransactionUrl(data.txId), "_blank"),
        },
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to collect", {
        description: error,
      });
    },
  });

  const onCollect = async () => {
    if (!session) {
      login();
      return;
    }

    if (!post.collectible || !post.minterFixedPrice) {
      return;
    }

    // Handle owner mint case
    if (isPostOwner) {
      const { parameters } = await sigleClient.ownerMint({
        contract: post.collectible.address,
      });

      await contractCall(parameters);
      return;
    }

    const { parameters } = await sigleClient.mint({
      sender: session.user.id,
      contract: post.collectible.address,
      amount: editions,
      referral: referral ? referral : undefined,
      price: post.minterFixedPrice.price,
    });

    await contractCall(parameters);
  };

  const incrementEditions = () => {
    if (!post.collectible || !post.minterFixedPrice) {
      return;
    }

    const remainingEditions = post.collectible.maxSupply - editions;
    if (
      (post.collectible.openEdition ||
        editions < post.collectible.maxSupply ||
        remainingEditions < 1) &&
      editions < maxMints
    ) {
      setEditions(editions + 1);
    }
  };

  const decrementEditions = () => {
    if (editions > 1) {
      setEditions(editions - 1);
    }
  };

  if (!post.minterFixedPrice || !post.collectible) {
    return null;
  }

  const price = BigInt(post.minterFixedPrice.price);
  const isFree = price === BigInt(0);
  const loadingCollect = contractLoading;
  const totalPrice = BigInt(editions) * (price + fixedMintFee.total);
  const protocolFee = BigInt(editions) * fixedMintFee.protocol;
  const creatorFee = BigInt(editions) * (price + fixedMintFee.creator);
  const createReferrerFee = BigInt(editions) * fixedMintFee.createReferrer;
  const mintReferrerFee = BigInt(editions) * fixedMintFee.mintReferrer;
  const maxMints = isPostOwner ? 1 : 10;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="3" className="max-w-md">
        <VisuallyHidden>
          <Dialog.Title>Collect</Dialog.Title>
          <Dialog.Description>Collect {editions} editions</Dialog.Description>
        </VisuallyHidden>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ProfileAvatar user={post.user} size="2" />
              <div className="grid gap-0.5">
                <p className="text-sm font-medium">
                  {post.user.profile?.displayName}
                </p>
                <p
                  className="text-xs text-muted-foreground"
                  title={post.user.id}
                >
                  {formatReadableAddress(post.user.id)}
                </p>
              </div>
            </div>
          </div>
          {post.coverImage ? (
            <div
              // oxlint-disable-next-line jsx-curly-brace-presence
              className={"h-[160px] w-full overflow-hidden rounded-2 bg-gray-2"}
            >
              <Image
                src={resolveImageUrl(post.coverImage.id)}
                alt={post.title}
                className="size-full object-cover"
                placeholder={post.coverImage.blurhash ? "blur" : "empty"}
                blurDataURL={post.coverImage.blurhash}
                width={post.coverImage.width}
                height={post.coverImage.height}
              />
            </div>
          ) : null}
          <div>
            <Heading size="3" className="line-clamp-2">
              {post.metaTitle || post.title}
            </Heading>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          </div>

          <Separator size="4" />

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Price</p>
            <p className="text-sm font-medium">
              {isFree ? "Free" : `${formatBTC(price)} sBTC`}
            </p>
          </div>
          <div className="flex items-center justify-between rounded-2 bg-gray-2 p-2">
            <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              Mint fee
              <a
                href={`${appConfig.docsUrl}/monetization#fee-structure`}
                target="_blank"
                rel="noreferrer"
              >
                <IconHelpCircle size={16} />
              </a>
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              {formatBTC(fixedMintFee.total)} sBTC
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Number of editions
              {!post.collectible.openEdition ? (
                <Badge variant="secondary" className="ml-1">
                  {post.collectible.maxSupply - post.collectible.collected} left
                </Badge>
              ) : null}
            </p>
            <div className="flex items-center space-x-2">
              <IconButton
                size="1"
                variant="outline"
                color="gray"
                highContrast
                onClick={decrementEditions}
                disabled={editions === 1}
              >
                <IconMinus className="size-4" />
              </IconButton>
              <p className="w-6 text-center text-sm font-medium">{editions}</p>
              <IconButton
                size="1"
                variant="outline"
                color="gray"
                highContrast
                onClick={incrementEditions}
                disabled={
                  (!post.collectible.openEdition &&
                    editions === post.collectible.maxSupply) ||
                  editions === maxMints
                }
              >
                <IconPlus className="size-4" />
              </IconButton>
            </div>
          </div>

          <Separator size="4" />

          <div className="flex items-start justify-between">
            <p className="flex items-center gap-1 text-base font-medium">
              Total{" "}
              {!isPostOwner ? (
                <Tooltip
                  content={
                    <div className="grid gap-2 p-2">
                      <div className="flex justify-between gap-2">
                        <p>Creator:</p>
                        <p>{formatBTC(creatorFee)} sBTC</p>
                      </div>
                      <div className="flex justify-between gap-2">
                        <p>Platform:</p>
                        <p>{formatBTC(protocolFee)} sBTC</p>
                      </div>
                      <div className="flex justify-between gap-2">
                        <p>Create referrer:</p>
                        <p>{formatBTC(createReferrerFee)} sBTC</p>
                      </div>
                      <div className="flex justify-between gap-2">
                        <p>Mint referrer:</p>
                        <p>{formatBTC(mintReferrerFee)} sBTC</p>
                      </div>
                    </div>
                  }
                >
                  <span className="text-muted-foreground">
                    <IconInfoCircle size={16} />
                  </span>
                </Tooltip>
              ) : null}
            </p>
            <div className="text-right">
              <p
                className={cn(
                  "text-base font-medium",
                  isPostOwner && "line-through",
                )}
              >
                {formatBTC(totalPrice)} sBTC
              </p>
              {!isPostOwner && loadingCurrencyFiatPrice ? (
                <p className="text-xs">
                  <Skeleton>price...</Skeleton>
                </p>
              ) : null}
              {!isPostOwner && totalPrice && currencyFiatPrice ? (
                <p className="text-xs text-muted-foreground">
                  ~
                  {formatUSDollar.format(
                    Number(formatBTC(totalPrice)) * Number(currencyFiatPrice),
                  )}
                </p>
              ) : null}
              {isPostOwner ? (
                <p className="text-xs text-muted-foreground">
                  Collect your own post for free.
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full"
              size="3"
              loading={loadingCollect}
              onClick={onCollect}
            >
              {isPostOwner ? "Collect as owner" : "Collect"}
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
