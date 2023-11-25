import React from 'react';
import { useSubscriptionControllerGetUserMe } from '@/__generated__/sigle-api';
import { SettingsLayout } from '../settings/SettingsLayout';
import { NftLockedView } from '../analytics/NftLockedView';

interface Props {
  children: JSX.Element;
}

export const ActiveSubscription = ({ children }: Props) => {
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

  return children;
};
