import Image from 'next/legacy/image';
import { Box, Button, Flex, Typography, LoadingSpinner } from '../../../ui';
import { SettingsLayout } from '../SettingsLayout';
import backpackImage from '../../../../public/img/illustrations/backpack.png';
import { useGetUserSubscription } from '../../../hooks/subscriptions';
import Link from 'next/link';
import { useAuth } from '../../auth/AuthContext';

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
  const { user, isLegacy } = useAuth();

  const currentPlan: 'starter' | 'creatorPlus' = userSubscription
    ? 'creatorPlus'
    : 'starter';

  const handleSyncWallet = () => {};

  return (
    <SettingsLayout>
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

      {isLegacy && (
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
      )}

      {isLoading ? (
        <Box css={{ py: '$10' }}>
          <LoadingSpinner />
        </Box>
      ) : null}

      {!isLoading && !isError ? (
        <Box css={{ mt: '$2', br: '$4', border: '1px solid $gray7' }}>
          <Flex
            align="center"
            gap="5"
            css={{
              background: '$gray2',
              borderBottom: '1px solid $gray7',
              padding: '$3',
              borderTopLeftRadius: '$4',
              borderTopRightRadius: '$4',
            }}
          >
            {currentPlan === 'starter' ? (
              <Image
                src={backpackImage}
                alt="Backpack"
                width={70}
                height={70}
                quality={100}
              />
            ) : (
              <Image
                src="/static/img/nft_locked.gif"
                alt="NFT Locked"
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

      {!isLegacy && !isLoading ? (
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
    </SettingsLayout>
  );
};
