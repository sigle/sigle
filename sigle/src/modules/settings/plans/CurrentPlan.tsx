import { Box, Button, Flex, Typography, LoadingSpinner } from '../../../ui';
import { SettingsLayout } from '../SettingsLayout';
import { useGetUserSubscription } from '../../../hooks/subscriptions';
import Link from 'next/link';
import { useAuth } from '../../auth/AuthContext';
import { useSyncWithNftSubscription } from '../../../hooks/subscriptions';
import { ComparePlans } from './ComparePlans';

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

  const currentPlan: 'starter' | 'creatorPlus' = userSubscription
    ? 'creatorPlus'
    : 'starter';

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
        justify="between"
      >
        <Typography
          size="h4"
          css={{
            fontWeight: 600,
            flexGrow: 1,
          }}
        >
          Current plan
        </Typography>
        {!isLoading && !isError ? (
          currentPlan === 'starter' ? (
            <Link href="/settings/plans/compare" passHref legacyBehavior>
              <Button size="sm" color="orange" as="a">
                Upgrade
              </Button>
            </Link>
          ) : (
            <Link href="/settings/plans/compare" passHref legacyBehavior>
              <Button size="sm" variant="subtle">
                Change plan
              </Button>
            </Link>
          )
        ) : null}
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
        >
          <Button size="lg" onClick={handleSyncWallet}>
            Sync wallet
          </Button>
        </Flex>
      ) : null}

      <ComparePlans />
    </SettingsLayout>
  );
};
