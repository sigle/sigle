import { useGetUserSubscription } from '../../../hooks/subscriptions';
import {
  Button,
  Typography,
  Switch,
  SwitchThumb,
  Flex,
  FormInput,
  FormRow,
} from '../../../ui';
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
  // TODO connect api key to form
  // TODO connect api secret to form
  // TODO here ink for where to find api key and secret
  // TODO real youtube video link
  // TODO review all wording

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

      <Typography css={{ fontWeight: 600, mt: '$5' }} size="h4">
        API key
      </Typography>
      <FormRow css={{ mt: '$2' }}>
        <FormInput
          name="apiKey"
          type="text"
          placeholder="Enter your Mailjet’s API key"
        />
      </FormRow>

      <Typography css={{ fontWeight: 600, mt: '$5' }} size="h4">
        API Secret
      </Typography>
      <FormRow css={{ mt: '$2', mb: '$2' }}>
        <FormInput
          name="apiSecret"
          type="text"
          placeholder="Enter your Mailjet’s API secret"
        />
      </FormRow>
      <Typography size="subheading" css={{ color: '$gray9', mt: '$2' }}>
        Find your Mailjet API key and API secret here
      </Typography>

      <Flex
        css={{ mt: '$5' }}
        direction={{ '@initial': 'column', '@md': 'row' }}
        gap="3"
      >
        <div>
          <Typography css={{ fontWeight: 600 }} size="h4">
            A bit lost? We show you how!
          </Typography>
          <Typography size="subheading" css={{ color: '$gray9', mt: '$2' }}>
            If you need help, we have created a tutorial on how to set up your
            newsletter using Sigle and Maillet.
            <br />
            <br />
            Follow this step by step video, you will see, it's easy!
          </Typography>
        </div>
        <iframe
          id="ytplayer"
          src="https://www.youtube.com/embed/8P3pL__udNM"
        ></iframe>
      </Flex>
    </SettingsLayout>
  );
};
