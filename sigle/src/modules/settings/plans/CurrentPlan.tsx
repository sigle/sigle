import { useState } from 'react';
import Image from 'next/image';
import { Box, Button, Flex, Typography } from '../../../ui';
import { SettingsLayout } from '../SettingsLayout';
import backpackImage from '../../../../public/img/illustrations/backpack.png';
import { useFeatureFlags } from '../../../utils/featureFlags';
import { SelectNFTDialog } from './SelectNFTDialog';

export const CurrentPlan = () => {
  const { isExperimentalAnalyticsPageEnabled } = useFeatureFlags();
  const [isSelectNFTDialogOpen, setIsSelectNFTDialogOpen] = useState(false);

  const currentPlan: 'starter' | 'creatorPlus' = 'creatorPlus';

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

  return (
    <SettingsLayout>
      <Flex align="center" justify="between">
        <Typography size="h4" css={{ fontWeight: 600 }}>
          Current plan
        </Typography>
        {isExperimentalAnalyticsPageEnabled ? (
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
        )}
      </Flex>

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

      <SelectNFTDialog
        open={isSelectNFTDialogOpen}
        onOpenChange={() => setIsSelectNFTDialogOpen(false)}
      />
    </SettingsLayout>
  );
};
