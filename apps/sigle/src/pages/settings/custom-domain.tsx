import React from 'react';
import Link from 'next/link';
import { useSubscriptionControllerGetUserMe } from '@/__generated__/sigle-api';
import { Protected } from '../../modules/auth/Protected';
import { SettingsLayout } from '../../modules/settings/SettingsLayout';
import { Box, Button, Flex, Typography } from '../../ui';
import { NftLockedView } from '../../modules/analytics/NftLockedView';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { CustomDomainForm } from '@/modules/settings/custom-domain/custom-domain-form';

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
      <Card>
        <CardHeader>
          <CardTitle>Custom Domain</CardTitle>
          <CardDescription>Add a custom domain to your blog.</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomDomainForm />
        </CardContent>
      </Card>
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
