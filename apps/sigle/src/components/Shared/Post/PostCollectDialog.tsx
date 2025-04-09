"use client";

import type { paths } from "@/__generated__/sigle-api/openapi";
import { appConfig } from "@/config";
import { useContractCall } from "@/hooks/useContractCall";
import {
  formatUSDollar,
  useCurrencyFiatPrice,
} from "@/hooks/useCurrencyFiatPrice";
import { useStacksLogin } from "@/hooks/useStacksLogin";
import { useSession } from "@/lib/auth-client";
import { resolveImageUrl } from "@/lib/images";
import { sigleClient } from "@/lib/sigle";
import {
  formatReadableAddress,
  getExplorerTransactionUrl,
  getPromiseTransactionConfirmation,
} from "@/lib/stacks";
import {
  Badge,
  Button,
  Dialog,
  Heading,
  IconButton,
  Separator,
  Skeleton,
  Text,
  Tooltip,
  VisuallyHidden,
} from "@radix-ui/themes";
import { fixedMintFee, formatBTC } from "@sigle/sdk";
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
import { ProfileAvatar } from "../Profile/ProfileAvatar";

interface PostCollectDialogProps {
  post: paths["/api/posts/list"]["get"]["responses"]["200"]["content"]["application/json"][number];
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
  const isPostOwner = session?.user.id === post.address.split(".")[0];

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

    // Handle owner mint case
    if (isPostOwner) {
      const { parameters } = await sigleClient.ownerMint({
        contract: post.address,
        amount: editions,
      });

      await contractCall(parameters);
      return;
    }

    const { parameters } = await sigleClient.mint({
      sender: session.user.id,
      contract: post.address,
      amount: editions,
      referral: referral ? referral : undefined,
      price: post.price,
    });

    await contractCall(parameters);
  };

  const incrementEditions = () => {
    const maxMints = 10;
    const remainingEditions = post.maxSupply - editions;
    if (
      (post.openEdition ||
        editions < post.maxSupply ||
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

  const price = BigInt(post.price);
  const isFree = price === BigInt(0);
  const loadingCollect = contractLoading;
  const totalPrice = BigInt(editions) * (price + fixedMintFee.total);
  const protocolFee = BigInt(editions) * fixedMintFee.protocol;
  const creatorFee = BigInt(editions) * (price + fixedMintFee.creator);
  const referrerFee = BigInt(editions) * fixedMintFee.mintReferrer;

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
                <Text size="2" weight="medium">
                  {post.user.profile?.displayName}
                </Text>
                <Text size="1" color="gray" title={post.user.id}>
                  {formatReadableAddress(post.user.id)}
                </Text>
              </div>
            </div>
          </div>
          {post.coverImage ? (
            <div className="h-[160px] w-full overflow-hidden rounded-2 bg-gray-2">
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
            <Text as="p" className="mt-2 line-clamp-3" color="gray" size="2">
              {post.excerpt}
            </Text>
          </div>

          <Separator size="4" />

          <div className="flex items-center justify-between">
            <Text as="p" size="2" weight="medium">
              Price
            </Text>
            <Text as="p" size="2" weight="medium">
              {isFree ? "Free" : `${formatBTC(price)} sBTC`}
            </Text>
          </div>
          <div className="flex items-center justify-between rounded-2 bg-gray-2 p-2">
            <Text
              as="p"
              size="1"
              weight="medium"
              color="gray"
              className="flex items-center gap-1"
            >
              Mint fee
              <a
                href={`${appConfig.docsUrl}/monetization#fee-structure`}
                target="_blank"
                rel="noreferrer"
              >
                <IconHelpCircle size={16} />
              </a>
            </Text>
            <Text as="p" size="1" weight="medium" color="gray">
              {formatBTC(fixedMintFee.total)} sBTC
            </Text>
          </div>
          <div className="flex items-center justify-between">
            <Text size="2" weight="medium">
              Number of editions
              {!post.openEdition ? (
                <Badge color="gray" highContrast className="ml-1">
                  {post.maxSupply - post.collected} left
                </Badge>
              ) : null}
            </Text>
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
              <Text className="w-6 text-center" size="2" weight="medium">
                {editions}
              </Text>
              <IconButton
                size="1"
                variant="outline"
                color="gray"
                highContrast
                onClick={incrementEditions}
                disabled={
                  (!post.openEdition && editions === post.maxSupply) ||
                  editions === 10
                }
              >
                <IconPlus className="size-4" />
              </IconButton>
            </div>
          </div>

          <Separator size="4" />

          <div className="flex items-start justify-between">
            <Text className="flex items-center gap-1" size="3" weight="medium">
              Total{" "}
              {!isPostOwner ? (
                <Tooltip
                  content={
                    <div className="grid gap-2 p-2">
                      <div className="flex justify-between gap-2">
                        <Text>Creator:</Text>
                        <Text>{formatBTC(creatorFee)} sBTC</Text>
                      </div>
                      <div className="flex justify-between gap-2">
                        <Text>Platform:</Text>
                        <Text>{formatBTC(protocolFee)} sBTC</Text>
                      </div>
                      <div className="flex justify-between gap-2">
                        <Text>Referrer:</Text>
                        <Text>{formatBTC(referrerFee)} sBTC</Text>
                      </div>
                    </div>
                  }
                >
                  <Text color="gray">
                    <IconInfoCircle size={16} />
                  </Text>
                </Tooltip>
              ) : null}
            </Text>
            <div className="text-right">
              <Text
                as="p"
                size="3"
                weight="medium"
                className={isPostOwner ? "line-through" : undefined}
              >
                {formatBTC(totalPrice)} sBTC
              </Text>
              {!isPostOwner && loadingCurrencyFiatPrice ? (
                <Text as="p" size="1">
                  <Skeleton>price...</Skeleton>
                </Text>
              ) : null}
              {!isPostOwner && totalPrice && currencyFiatPrice ? (
                <Text as="p" size="1" color="gray">
                  ~
                  {formatUSDollar.format(
                    Number(formatBTC(totalPrice)) * Number(currencyFiatPrice),
                  )}
                </Text>
              ) : null}
              {isPostOwner ? (
                <Text as="p" size="1" color="gray">
                  Collect your own post for free.
                </Text>
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
