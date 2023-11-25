import React, { useState } from 'react';
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
import { useDomainsControllerGet } from '@/__generated__/sigle-api';
import { CustomDomainDns } from '@/modules/settings/custom-domain/custom-domain-dns';
import { Typography } from '@/ui';

const CustomDomain = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: domain, isLoading: isLoadingDomain } = useDomainsControllerGet(
    {},
  );

  return (
    <SettingsLayout>
      <Card>
        <CardHeader>
          <Typography css={{ fontWeight: 600 }} size="h4">
            Custom domain
          </Typography>
          <CardDescription>Add a custom domain to your blog.</CardDescription>
        </CardHeader>
        <CardContent>
          {(!isLoadingDomain && !domain) || isEditing ? (
            <CustomDomainForm domain={domain} setIsEditing={setIsEditing} />
          ) : null}
          {!isLoadingDomain && domain && !isEditing ? (
            <CustomDomainDns domain={domain} setIsEditing={setIsEditing} />
          ) : null}
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
