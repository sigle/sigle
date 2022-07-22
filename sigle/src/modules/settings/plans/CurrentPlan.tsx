import { useState } from 'react';
import Image from 'next/image';
import { Box, Button, Flex, Typography, LoadingSpinner } from '../../../ui';
import { SettingsLayout } from '../SettingsLayout';
import backpackImage from '../../../../public/img/illustrations/backpack.png';
import { useGetUserSubscription } from '../../../hooks/subscriptions';
import Link from 'next/link';
import { sigleConfig } from '../../../config';
import { SelectNFTDialog } from './SelectNFTDialog';

const plans = {
  starter: {
    title: "You're a Starter member!",
    description: 'All the basics for casual writers',
    features: [
      {
        title: 'Write unlimited stories',
        status: 'done',
      },
      {
        title: 'Data stored on Gaïa',
        status: 'done',
      },
      {
        title: 'Monetise your stories',
        status: 'progress',
      },
      {
        title: 'Send newsletters',
        status: 'progress',
      },
    ],
  },
  creatorPlus: {
    title: "You're a Creator + member!",
    description:
      'Hold your NFT and get lifetime access to the premium features',
    features: [
      {
        title: 'Write unlimited stories',
        status: 'done',
      },
      {
        title: 'Data stored on Gaïa',
        status: 'done',
      },
      {
        title: 'Analytics',
        status: 'done',
      },
      {
        title: 'Monetise your stories',
        status: 'progress',
      },
      {
        title: 'Send newsletters',
        status: 'progress',
      },
      {
        title: 'And more...',
        status: 'progress',
      },
    ],
  },
};

export const CurrentPlan = () => {
  const {
    isLoading,
    isError,
    data: userSubscription,
  } = useGetUserSubscription();
  const [isSelectNFTDialogOpen, setIsSelectNFTDialogOpen] = useState(false);

  const currentPlan: 'starter' | 'creatorPlus' = userSubscription
    ? 'creatorPlus'
    : 'starter';

  const NFTImageURL = `${sigleConfig.explorerGuildUrl}/nft-images/?image=ar://Z4ygyXm-fERGzKEB2bvE7gx98SHcoaP8qdZQo0Kxm6Y`;

  return (
    <SettingsLayout>
      <Flex align="center" justify="between">
        <Typography size="h4" css={{ fontWeight: 600 }}>
          Current plan
        </Typography>
        {!isLoading && !isError ? (
          currentPlan === 'starter' ? (
            <Link href="/settings/plans/compare" passHref>
              <Button color="orange" as="a">
                Upgrade
              </Button>
            </Link>
          ) : (
            <Link href="/settings/plans/compare" passHref>
              <Button variant="subtle">Change plan</Button>
            </Link>
          )
        ) : null}
      </Flex>

      {isLoading ? (
        <Box css={{ py: '$10' }}>
          <LoadingSpinner />
        </Box>
      ) : null}

      {!isLoading && !isError ? (
        <Box css={{ mt: '$2', borderRadius: '$3', border: '1px solid $gray7' }}>
          <Flex
            align="center"
            gap="5"
            css={{
              background: '$gray2',
              borderBottom: '1px solid $gray7',
              padding: '$3',
              borderTopLeftRadius: '$3',
              borderTopRightRadius: '$3',
            }}
          >
            {currentPlan === 'starter' ? (
              <Image src={backpackImage} width={70} height={70} quality={100} />
            ) : (
              <Image
                src="/static/img/nft_locked.gif"
                width={70}
                height={64}
                quality={100}
              />
            )}
            <Flex direction="column" gap="1">
              <Typography size="h4" css={{ fontWeight: 600 }}>
                {plans[currentPlan].title}
              </Typography>
              <Typography size="subheading">
                {plans[currentPlan].description}
              </Typography>
            </Flex>
          </Flex>
          <Flex gap="2" direction="column" css={{ padding: '$3' }}>
            {plans[currentPlan].features.map(({ title, status }, index) => (
              <Typography key={`${currentPlan}-${index}`} size="subheading">
                <Box as="span" css={{ marginRight: '$2' }}>
                  {status === 'done' ? '✅' : '⚙️'}
                </Box>
                {title}
              </Typography>
            ))}
          </Flex>
        </Box>
      ) : null}

      {!isLoading && currentPlan === 'creatorPlus' ? (
        <>
          <Typography size="h4" css={{ fontWeight: 600, mt: '$5' }}>
            Manage your Creator + NFT
          </Typography>
          <Flex
            align="center"
            justify="between"
            css={{
              mt: '$2',
              borderRadius: '$3',
              border: '1px solid $gray7',
              background: '$gray2',
              padding: '$3',
            }}
          >
            <Flex align="center">
              <Box
                as="img"
                src={`${NFTImageURL}/${userSubscription?.nftId}.png&size=170`}
                css={{ width: 92, height: 92, borderRadius: '$3' }}
              />
              <Flex direction="column" gap="1" css={{ ml: '$5' }}>
                <Typography size="h4" css={{ fontWeight: 600 }}>
                  You picked Explorer #{userSubscription?.nftId}
                </Typography>
                <Typography size="subheading">
                  This NFT is currently linked to your Creator + plan.
                </Typography>
                <Typography size="subheading">
                  Listing or selling it will downgrade you to Starter plan.
                </Typography>
              </Flex>
            </Flex>
            <Button size="lg" onClick={() => setIsSelectNFTDialogOpen(true)}>
              Change
            </Button>
          </Flex>
        </>
      ) : null}

      <SelectNFTDialog
        open={isSelectNFTDialogOpen}
        onOpenChange={() => setIsSelectNFTDialogOpen(false)}
      />
    </SettingsLayout>
  );
};
