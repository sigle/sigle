import { CheckCircledIcon } from '@radix-ui/react-icons';
import { useFormik, FormikErrors } from 'formik';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { ApiError } from '../../../external/api';
import { useUpdateNewsletter } from '../../../hooks/newsletters';
import { useGetUserSubscription } from '../../../hooks/subscriptions';
import {
  Button,
  Typography,
  Flex,
  FormInput,
  FormRow,
  FormHelperError,
  Box,
} from '../../../ui';
import { NftLockedView } from '../../analytics/NftLockedView';
import { SettingsLayout } from '../SettingsLayout';
import { SenderEmail } from './SenderEmail';
import { VideoHelp } from './VideoHelp';
import { MailjetList } from './MailjetList';
import { useNewslettersControllerGet } from '@/__generated__/sigle-api/sigleApiComponents';

interface NewsletterSettingsFormValues {
  apiKey: string;
  apiSecret: string;
}

export const Newsletter = () => {
  const { isLoading, data: userSubscription } = useGetUserSubscription();
  const { data: userNewsletter, refetch: refetchUserNewsletter } =
    useNewslettersControllerGet({});
  const { mutate: updateNewsletter, isLoading: isLoadingUpdateNewsletter } =
    useUpdateNewsletter({
      onError: (error: Error | ApiError) => {
        let errorMessage = error.message;
        if (error instanceof ApiError && error.body.message) {
          errorMessage = error.body.message;
        }
        toast.error(errorMessage);
      },
      onSuccess: async () => {
        await refetchUserNewsletter();
        toast.success('Mailjet configuration updated!');
      },
    });

  // TODO review all wording

  const formik = useFormik<NewsletterSettingsFormValues>({
    validateOnChange: false,
    initialValues: {
      apiKey: userNewsletter ? userNewsletter.mailjetApiKey : '',
      apiSecret: userNewsletter ? userNewsletter.mailjetApiSecret : '',
    },
    validate: (values) => {
      const errors: FormikErrors<NewsletterSettingsFormValues> = {};
      if (!values.apiKey || values.apiKey === '') {
        errors.apiKey = 'API key is required';
      }
      if (!values.apiSecret || values.apiSecret === '') {
        errors.apiSecret = 'API secret is required';
      }
      return errors;
    },
    onSubmit: async (values) => {
      updateNewsletter({
        apiKey: values.apiKey.trim(),
        apiSecret: values.apiSecret.trim(),
      });
    },
  });

  useEffect(() => {
    if (userNewsletter) {
      formik.resetForm({
        values: {
          apiKey: userNewsletter.mailjetApiKey,
          apiSecret: userNewsletter.mailjetApiSecret,
        },
      });
    }
  }, [userNewsletter]);

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
      <Flex gap="10">
        <div>
          <Typography css={{ fontWeight: 600, mt: '$5' }} size="h4">
            Mailjet configuration
          </Typography>
          <Typography size="subheading" css={{ color: '$gray9', mt: '$2' }}>
            The Mailjet API is used for bulk email newsletter delivery. To send
            your first newsletter, you need to create an account on Mailjet and
            enter the information in the inputs below.
          </Typography>
        </div>
        <div>
          {(!userNewsletter || userNewsletter.status !== 'ACTIVE') && (
            <Button
              css={{ mt: '$3' }}
              as="a"
              href="https://sinchemails.grsm.io/7i0c8m9zrvef-fxdog"
              target="_blank"
              variant="subtle"
            >
              Create Mailjet account
            </Button>
          )}
          {userNewsletter?.status === 'ACTIVE' && (
            <Button
              css={{ mt: '$3' }}
              as="a"
              href="https://app.mailjet.com"
              target="_blank"
              variant="subtle"
            >
              Mailjet dashboard
            </Button>
          )}
        </div>
      </Flex>
      <form onSubmit={formik.handleSubmit}>
        <Box
          css={{
            background: '$gray2',
            border: '1px solid $gray7',
            br: '$4',
            padding: '$5',
            mt: '$5',
          }}
        >
          <Typography css={{ fontWeight: 600 }} size="h4">
            API key
          </Typography>
          <FormRow css={{ mt: '$2' }}>
            <Flex gap="2" align="center">
              <FormInput
                name="apiKey"
                type="text"
                placeholder="Enter your Mailjet’s API key"
                value={formik.values.apiKey}
                onChange={formik.handleChange}
              />
              {userNewsletter?.mailjetApiKey && (
                <Box css={{ color: '$green11' }}>
                  <CheckCircledIcon />
                </Box>
              )}
            </Flex>
            {formik.errors.apiKey && (
              <FormHelperError>{formik.errors.apiKey}</FormHelperError>
            )}
          </FormRow>

          <Typography css={{ fontWeight: 600, mt: '$5' }} size="h4">
            API Secret
          </Typography>
          <FormRow css={{ mt: '$2', mb: '$2' }}>
            <Flex gap="2" align="center">
              <FormInput
                name="apiSecret"
                type="text"
                placeholder="Enter your Mailjet’s API secret"
                value={formik.values.apiSecret}
                onChange={formik.handleChange}
              />
              {userNewsletter?.mailjetApiSecret && (
                <Box css={{ color: '$green11' }}>
                  <CheckCircledIcon />
                </Box>
              )}
            </Flex>
            {formik.errors.apiSecret && (
              <FormHelperError>{formik.errors.apiSecret}</FormHelperError>
            )}
          </FormRow>
          <Typography size="subheading" css={{ color: '$gray9', mt: '$2' }}>
            Find your Mailjet API key and API secret{' '}
            <Typography
              size="subheading"
              as="a"
              href="https://app.mailjet.com/account/apikeys"
              target="_blank"
              rel="noreferrer"
              css={{ color: '$orange11', cursor: 'pointer' }}
            >
              here
            </Typography>
          </Typography>

          <Button
            css={{ mt: '$5' }}
            type="submit"
            disabled={isLoadingUpdateNewsletter}
          >
            {isLoadingUpdateNewsletter ? 'Saving...' : 'Submit'}
          </Button>
        </Box>
      </form>

      {userNewsletter && <MailjetList />}
      {userNewsletter && <SenderEmail />}

      <VideoHelp />
    </SettingsLayout>
  );
};
