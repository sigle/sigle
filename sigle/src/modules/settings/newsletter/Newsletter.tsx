import { useGetUserSubscription } from '../../../hooks/subscriptions';
import { Button, Typography, Switch, SwitchThumb, Flex } from '../../../ui';
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
      <Flex justify="between" gap="5">
        <div>
          <Typography css={{ fontWeight: 600 }} size="h4">
            Enable Newsletter
          </Typography>
          <Typography size="subheading" css={{ color: '$gray9', mt: '$2' }}>
            Switching this toggle to "off" will disable the communication
            between Sigle and Mailjet.
            <br />
            You won't be able to send emails anymore.
          </Typography>
        </div>
        <div>
          <Switch checked={true}>
            <SwitchThumb />
          </Switch>
        </div>
      </Flex>
    </SettingsLayout>
  );
};
