import { useGetUserSubscription } from '../../../hooks/subscriptions';
import { Typography } from '../../../ui';
import { NftLockedView } from '../../analytics/NftLockedView';
import { SettingsLayout } from '../SettingsLayout';

export const Newsletter = () => {
  const { isLoading, data: userSubscription } = useGetUserSubscription();

  if (isLoading) {
    return <SettingsLayout layout="wide">Loading...</SettingsLayout>;
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
      <Typography css={{ fontWeight: 600 }} size="h4">
        Newsletter
      </Typography>
    </SettingsLayout>
  );
};
