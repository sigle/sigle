import { useState } from 'react';
import Image from 'next/image';
import { useQuery } from 'react-query';
import { Box, Button, Flex, Typography, LoadingSpinner } from '../../../ui';
import { SettingsLayout } from '../SettingsLayout';
import backpackImage from '../../../../public/img/illustrations/backpack.png';
import { useFeatureFlags } from '../../../utils/featureFlags';
import { SelectNFTDialog } from './SelectNFTDialog';
import { sigleConfig } from '../../../config';
import { useGetUserSubscription } from '../../../hooks/subscriptions';

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
  const { isExperimentalAnalyticsPageEnabled } = useFeatureFlags();
  const [isSelectNFTDialogOpen, setIsSelectNFTDialogOpen] = useState(false);

  const {
    isLoading,
    isError,
    data: userSubscription,
  } = useGetUserSubscription();

  const currentPlan: 'starter' | 'creatorPlus' = userSubscription
    ? 'creatorPlus'
    : 'starter';

  return (
    <SettingsLayout>
      <Flex align="center" justify="between">
        <Typography size="h4" css={{ fontWeight: 600 }}>
          Current plan
        </Typography>
        {!isLoading && !isError ? (
          isExperimentalAnalyticsPageEnabled ? (
            currentPlan === 'starter' ? (
              <Button
                color="orange"
                onClick={() => setIsSelectNFTDialogOpen(true)}
              >
                Upgrade
              </Button>
            ) : (
              <Button variant="subtle">Change plan</Button>
            )
          ) : (
            <Button disabled color="orange">
              Upgrade (coming soon)
            </Button>
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
                src="https://images.stxnft.space/https://storage.googleapis.com/the-explorer-guild/7ee9aa5bfb3645c991ab0af5a36b42c0697be09ce7abdbed02cbd91e303eb681.png?auto=format&fit=max&w=460&q=100&cs=srgb"
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
            <Button size="lg">Change</Button>
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
