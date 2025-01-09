'use client';

import type { paths } from '@/__generated__/sigle-api/openapi';
import {
  formatUSDollar,
  useCurrencyFiatPrice,
} from '@/hooks/useCurrencyFiatPrice';
import {
  Avatar,
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
} from '@radix-ui/themes';
import {
  IconHelpCircle,
  IconInfoCircle,
  IconMinus,
  IconPlus,
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatSTX, fixedMintFee } from '@sigle/sdk';
import { sigleClient } from '@/lib/sigle';
import { formatReadableAddress, getExplorerTransactionUrl } from '@/lib/stacks';
import { useContractCall } from '@/hooks/useContractCall';
import { useStacksLogin } from '@/hooks/useStacksLogin';
import { resolveImageUrl } from '@/lib/images';
import Image from 'next/image';

interface PostCollectDialogProps {
  post: paths['/api/posts/{postId}']['get']['responses']['200']['content']['application/json'];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PostCollectDialog = ({
  post,
  open,
  onOpenChange,
}: PostCollectDialogProps) => {
  const searchParams = useSearchParams();
  const referral = searchParams.get('referral');
  const { data: session } = useSession();
  const { login } = useStacksLogin();
  const { data: currencyFiatPrice, isLoading: loadingCurrencyFiatPrice } =
    useCurrencyFiatPrice(
      // We wait for the dialog to be open to fetch the price
      open ? 'STX' : undefined,
    );
  const [editions, setEditions] = useState(1);
  const { contractCall, loading: contractLoading } = useContractCall({
    onSuccess: (data) => {
      toast.success('Transaction submitted', {
        action: {
          label: 'View tx',
          onClick: () =>
            window.open(getExplorerTransactionUrl(data.txId), '_blank'),
        },
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to collect', {
        description: error,
      });
    },
  });

  const onCollect = async () => {
    if (!session) {
      login();
      return;
    }

    const { parameters } = await sigleClient.mint({
      sender: session.user.address,
      contract: post.address,
      amount: editions,
      referral: referral ? referral : undefined,
      price: post.price,
    });

    await contractCall(parameters);
  };

  const incrementEditions = () => {
    const remainingEditions = post.maxSupply - editions;
    if (
      post.openEdition ||
      editions < post.maxSupply ||
      remainingEditions < 1
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
              <Avatar
                size="2"
                fallback="T"
                radius="full"
                src={
                  post.user.profile?.pictureUri
                    ? resolveImageUrl(post.user.profile.pictureUri)
                    : undefined
                }
              />
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
            <div className="w-full h-[160px] bg-gray-2 rounded-2 overflow-hidden">
              <Image
                src={resolveImageUrl(post.coverImage.id)}
                alt={post.title}
                className="w-full h-full object-cover"
                placeholder={post.coverImage.blurhash ? 'blur' : 'empty'}
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
              {isFree ? 'Free' : `${formatSTX(price)} STX`}
            </Text>
          </div>
          <div className="flex items-center justify-between bg-gray-2 p-2 rounded-2">
            <Text
              as="p"
              size="1"
              weight="medium"
              color="gray"
              className="flex items-center gap-1"
            >
              Mint fee
              <a
                href="https://docs.sigle.io/TODO"
                target="_blank"
                rel="noreferrer"
              >
                <IconHelpCircle size={16} />
              </a>
            </Text>
            <Text as="p" size="1" weight="medium" color="gray">
              {formatSTX(fixedMintFee.total)} STX
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
                <IconMinus className="h-4 w-4" />
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
                disabled={!post.openEdition && editions === post.maxSupply}
              >
                <IconPlus className="h-4 w-4" />
              </IconButton>
            </div>
          </div>

          <Separator size="4" />

          <div className="flex items-start justify-between">
            <Text className="flex items-center gap-1" size="3" weight="medium">
              Total{' '}
              <Tooltip
                content={
                  <div className="grid gap-2 p-2">
                    <div className="flex justify-between gap-2">
                      <Text>Creator:</Text>
                      <Text>{formatSTX(creatorFee)} STX</Text>
                    </div>
                    <div className="flex justify-between gap-2">
                      <Text>Platform:</Text>
                      <Text>{formatSTX(protocolFee)} STX</Text>
                    </div>
                    <div className="flex justify-between gap-2">
                      <Text>Referrer:</Text>
                      <Text>{formatSTX(referrerFee)} STX</Text>
                    </div>
                  </div>
                }
              >
                <Text color="gray">
                  <IconInfoCircle size={16} />
                </Text>
              </Tooltip>
            </Text>
            <div className="text-right">
              <Text as="p" size="3" weight="medium">
                {formatSTX(totalPrice)} STX
              </Text>
              {loadingCurrencyFiatPrice ? (
                <Text as="p" size="1">
                  <Skeleton>price...</Skeleton>
                </Text>
              ) : null}
              {totalPrice && currencyFiatPrice ? (
                <Text as="p" size="1" color="gray">
                  ~
                  {formatUSDollar.format(
                    Number(formatSTX(totalPrice)) * Number(currencyFiatPrice),
                  )}
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
              Collect
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
