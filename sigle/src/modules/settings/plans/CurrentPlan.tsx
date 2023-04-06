import { Box, Button, Flex, Typography, LoadingSpinner } from '../../../ui';
import { SettingsLayout } from '../SettingsLayout';
import { useGetUserSubscription } from '../../../hooks/subscriptions';
import Link from 'next/link';
import { useAuth } from '../../auth/AuthContext';
import { useSyncWithNftSubscription } from '../../../hooks/subscriptions';
import { ComparePlans } from './ComparePlans';
import { sigleConfig } from '../../../config';

export const CurrentPlan = () => {
  const { user, isLegacy } = useAuth();
  const {
    isLoading,
    isError,
    data: userSubscription,
  } = useGetUserSubscription();
  const {
    isLoading: isLoadingSync,
    isError: isErrorSync,
    error: errorSync,
    isSuccess: isSuccessSync,
    mutate: syncWithNftSubscription,
  } = useSyncWithNftSubscription({
    onSuccess: () => {
      // TODO show success modal if user did upgrade
      // TODO refetch user subscription
    },
  });

  const currentPlan: 'Starter' | 'Basic' | 'Publisher' = !userSubscription
    ? 'Starter'
    : userSubscription.plan === 'BASIC'
    ? 'Basic'
    : 'Publisher';

  const handleSyncWallet = () => {
    syncWithNftSubscription();
  };

  if (isLegacy) {
    return (
      <SettingsLayout>
        <Flex direction="column" css={{ mt: '$5' }} gap="3" align="center">
          <Typography size="subheading">
            This feature is available for Hiro wallet accounts only
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
              {!isLoadingSync ? 'Scan wallet' : 'Syncing...'}
            </Button>
            <Link href={sigleConfig.gammaUrl} target="_blank">
              <Button size="lg" variant="outline">
                Buy NFT
              </Button>
            </Link>
          </Flex>
        </Flex>
      ) : null}

      <ComparePlans />
    </SettingsLayout>
  );
};
