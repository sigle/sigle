import Link from 'next/link';
import { toast } from 'sonner';
import {
  useSubscriptionControllerGetUserMe,
  useSubscriptionControllerSyncSubscriptionWithNft,
} from '@/__generated__/sigle-api';
import { Box, Button, Flex, Typography, LoadingSpinner } from '../../../ui';
import { SettingsLayout } from '../SettingsLayout';
import { sigleConfig } from '../../../config';
import { ComparePlans } from './ComparePlans';

export const CurrentPlan = () => {
  const {
    isLoading,
    data: userSubscription,
    refetch: refetchUserSubscription,
  } = useSubscriptionControllerGetUserMe({});
  const { isLoading: isLoadingSync, mutate: syncWithNftSubscription } =
    useSubscriptionControllerSyncSubscriptionWithNft({
      onSuccess: (data) => {
        // If no NFT found
        if (!data) {
          toast(
            'You don’t have enough NFTs to upgrade your account. Make sure your NFTs are not listed and try again.',
          );
          return;
        }
        // If plan changed
        if (data.plan !== userSubscription?.plan) {
          toast.success(
            `Your plan has been upgraded to ${data.plan.toLowerCase()} plan!`,
          );
          refetchUserSubscription();
        } else if (data.plan === userSubscription?.plan) {
          // If plan didn't change
          toast('Your plan is already up to date');
        }
      },
      onError: (error) => {
        toast.error(error?.message);
      },
    });

  const currentPlan: 'Starter' | 'Basic' | 'Publisher' | 'Enterprise' =
    !userSubscription
      ? 'Starter'
      : userSubscription.plan === 'BASIC'
        ? 'Basic'
        : userSubscription.plan === 'ENTERPRISE'
          ? 'Enterprise'
          : 'Publisher';

  const handleSyncWallet = () => {
    syncWithNftSubscription({});
  };

  return (
    <SettingsLayout layout="wide">
      <Flex
        css={{
          pb: 0,
          mb: 0,
          borderBottom: 'none',
        }}
        align="center"
        gap="2"
      >
        <Typography
          size="h4"
          css={{
            fontWeight: 600,
          }}
        >
          Current plan
        </Typography>
        {!isLoading && (
          <Typography
            size="subheading"
            css={{
              backgroundColor:
                currentPlan === 'Starter'
                  ? '$gray5'
                  : currentPlan === 'Basic'
                    ? '$green5'
                    : '$violet5',
              px: '$3',
              py: '$1',
              br: '$2',
            }}
          >
            {currentPlan}
          </Typography>
        )}
      </Flex>

      {isLoading ? (
        <Box css={{ py: '$10' }}>
          <LoadingSpinner />
        </Box>
      ) : null}

      {!isLoading ? (
        <Flex
          align="center"
          justify="between"
          css={{
            mt: '$2',
            br: '$4',
            border: '1px solid $gray7',
            background: '$gray2',
            padding: '$3',
          }}
          gap="4"
        >
          <Flex direction="column" gap="1">
            <Typography size="h4">
              Upgrade with your Explorer Guild NFT
            </Typography>
            <Typography size="subheading">
              Let us scan your wallet to confirm that you have 1 or more
              Explorer Guild NFTs and unlock your plan.
              <br />
              Listing or selling your NFT(s) will downgrade your account.
            </Typography>
          </Flex>
          <Flex gap="5">
            <Button
              size="lg"
              onClick={handleSyncWallet}
              disabled={isLoadingSync}
            >
              {!isLoadingSync ? 'Scan wallet' : 'Scanning...'}
            </Button>
            <Link href={sigleConfig.gammaUrl} target="_blank">
              <Button size="lg" variant="outline">
                Buy NFT
              </Button>
            </Link>
          </Flex>
        </Flex>
      ) : null}

      {!isLoading ? <ComparePlans currentPlan={currentPlan} /> : null}
    </SettingsLayout>
  );
};
