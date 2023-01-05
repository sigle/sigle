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

  // TODO connect switch to form

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

      <Typography css={{ fontWeight: 600, mt: '$5' }} size="h4">
        Mailjet configuration
      </Typography>
      <Typography size="subheading" css={{ color: '$gray9', mt: '$2' }}>
        The Mailjet API is used for bulk email newsletter delivery. To send your
        first newsletter, you need to create an account on Mailjet and enter the
        information in the inputs below.
      </Typography>
      <Button
        css={{ mt: '$3' }}
        as="a"
        href="https://sinchemails.grsm.io/7i0c8m9zrvef-fxdog"
        target="_blank"
      >
        Create Mailjet account
      </Button>
    </SettingsLayout>
  );
};
