import React from 'react';
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
import { ActiveSubscription } from '@/modules/auth/ActiveSubscription';

const CustomDomain = () => {
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
      <ActiveSubscription>
        <CustomDomain />
      </ActiveSubscription>
    </Protected>
  );
};

export default CustomDomainPage;
