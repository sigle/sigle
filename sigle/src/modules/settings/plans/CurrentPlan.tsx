import { Box, Button, Flex, Typography, LoadingSpinner } from '../../../ui';
import { SettingsLayout } from '../SettingsLayout';
import { useGetUserSubscription } from '../../../hooks/subscriptions';
import Link from 'next/link';
import { useAuth } from '../../auth/AuthContext';
import { useSyncWithNftSubscription } from '../../../hooks/subscriptions';
import { ComparePlans } from './ComparePlans';
import { sigleConfig } from '../../../config';
import { toast } from 'react-toastify';

export const CurrentPlan = () => {
  const { user, isLegacy } = useAuth();
  const {
    isLoading,
    data: userSubscription,
    refetch: refetchUserSubscription,
  } = useGetUserSubscription();
  const { isLoading: isLoadingSync, mutate: syncWithNftSubscription } =
    useSyncWithNftSubscription({
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
    syncWithNftSubscription();
  };

  if (isLegacy) {
    return (
      <SettingsLayout>
        <Flex direction="column" css={{ mt: '$5' }} gap="3" align="center">
          <Typography size="subheading">
            This feature is available for Leather and Xverse wallet accounts
            only
          </Typography>
          <Link href={`/${user?.username}`} passHref legacyBehavior>
            <Button size="sm" variant="subtle" as="a">
              Back to profile
            </Button>
          </Link>
        </Flex>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout layout="wide">
      <Flex
        css={{
          pb: isLegacy ? '$5' : 0,
          mb: isLegacy ? '$2' : 0,
          borderBottom: isLegacy ? '1px solid $colors$gray6' : 'none',
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
