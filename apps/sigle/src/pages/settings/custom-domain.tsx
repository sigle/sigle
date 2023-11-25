import React from 'react';
import { useSubscriptionControllerGetUserMe } from '@/__generated__/sigle-api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { CustomDomainForm } from '@/modules/settings/custom-domain/custom-domain-form';
import { Protected } from '../../modules/auth/Protected';
import { SettingsLayout } from '../../modules/settings/SettingsLayout';
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
