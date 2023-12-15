import React from 'react';
import Link from 'next/link';
import { useSubscriptionControllerGetUserMe } from '@/__generated__/sigle-api';
import { Protected } from '../../components/authentication/protected';
import { SettingsLayout } from '../../modules/settings/SettingsLayout';
import { Box, Button, Flex, Typography } from '../../ui';
import { NftLockedView } from '../../modules/analytics/NftLockedView';

const CustomDomain = () => {
  const { isLoading, data: userSubscription } =
    useSubscriptionControllerGetUserMe({});

  if (isLoading) {
    return <SettingsLayout>Loading...</SettingsLayout>;
  }

  if (!isLoading && !userSubscription) {
    return (
      <SettingsLayout>
        <NftLockedView />
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <Flex gap="10" justify="between">
        <div>
          <Typography css={{ fontWeight: 600 }} size="h4">
            Custom domain
          </Typography>
          <Typography size="subheading" css={{ color: '$gray9', mt: '$2' }}>
            Please fill the form to access the beta feature.
            <br />
            Read the full announcement{' '}
            <Box
              as={Link}
              href="https://twitter.com/sigleapp/status/1643272042005815297"
              target="_blank"
              css={{ color: '$orange11' }}
            >
              on Twitter
            </Box>
            .
          </Typography>
        </div>
        <div>
          <Button
            as="a"
            href="https://blocksurvey.io/survey/p/a7c1c424-4e5c-44cf-90d3-882334cb6af4"
            target="_blank"
          >
            Custom domain form
          </Button>
        </div>
      </Flex>
    </SettingsLayout>
  );
};

const CustomDomainPage = () => {
  return (
    <Protected>
      <CustomDomain />
    </Protected>
  );
};

export default CustomDomainPage;
