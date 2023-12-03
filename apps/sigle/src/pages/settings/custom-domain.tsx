import React, { useState } from 'react';
import { Card, Heading, Text } from '@radix-ui/themes';
import { CustomDomainForm } from '@/modules/settings/custom-domain/custom-domain-form';
import { ActiveSubscription } from '@/modules/auth/ActiveSubscription';
import { useDomainsControllerGet } from '@/__generated__/sigle-api';
import { CustomDomainDns } from '@/modules/settings/custom-domain/custom-domain-dns';
import { SettingsLayout } from '../../modules/settings/SettingsLayout';
import { Protected } from '../../modules/auth/Protected';

const CustomDomain = () => {
  const [isEditing, setIsEditing] = useState(false);
  const {
    data: domain,
    isLoading: isLoadingDomain,
    refetch: refetchDomain,
  } = useDomainsControllerGet({});

  return (
    <SettingsLayout>
      <Card size="2">
        <div className="space-y-4">
          <div>
            <Heading size="4" as="h4">
              Custom domain
            </Heading>
            <Text size="2" color="gray">
              Add a custom domain to your blog.
            </Text>
          </div>
          {(!isLoadingDomain && !domain) || isEditing ? (
            <CustomDomainForm
              domain={domain}
              setIsEditing={setIsEditing}
              refetchDomain={refetchDomain}
            />
          ) : null}
          {!isLoadingDomain && domain && !isEditing ? (
            <CustomDomainDns domain={domain} setIsEditing={setIsEditing} />
          ) : null}
        </div>
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
