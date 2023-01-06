import { useFormik, FormikErrors } from 'formik';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { ApiError } from '../../../external/api';
import {
  useGetUserNewsletter,
  useUpdateNewsletter,
} from '../../../hooks/newsletters';
import { useGetUserSubscription } from '../../../hooks/subscriptions';
import {
  Button,
  Typography,
  Switch,
  SwitchThumb,
  Flex,
  FormInput,
  FormRow,
  FormHelperError,
} from '../../../ui';
import { NftLockedView } from '../../analytics/NftLockedView';
import { UnsavedChanges } from '../components/UnsavedChanges';
import { SettingsLayout } from '../SettingsLayout';

interface NewsletterSettingsFormValues {
  enabled: boolean;
  apiKey: string;
  apiSecret: string;
}

export const Newsletter = () => {
  const { isLoading, data: userSubscription } = useGetUserSubscription();
  const { data: userNewsletter, refetch: refetchUserNewsletter } =
    useGetUserNewsletter();
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
        toast.success('Newsletter configuration updated!');
      },
    });

  // TODO here link for where to find api key and secret
  // TODO real youtube video link
  // TODO review all wording
  // TODO rename prisma schema apikey to apiKey

  const formik = useFormik<NewsletterSettingsFormValues>({
    validateOnChange: false,
    initialValues: {
      enabled: userNewsletter ? userNewsletter.enabled : true,
      apiKey: userNewsletter ? userNewsletter.mailjetApikey : '',
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
        enabled: values.enabled,
        apiKey: values.apiKey.trim(),
        apiSecret: values.apiSecret.trim(),
      });
    },
  });

  useEffect(() => {
    if (userNewsletter) {
      formik.resetForm({
        values: {
          enabled: userNewsletter.enabled,
          apiKey: userNewsletter.mailjetApikey,
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
      <form onSubmit={formik.handleSubmit}>
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
            <Switch
              checked={formik.values.enabled}
              onCheckedChange={() =>
                formik.setFieldValue('enabled', !formik.values.enabled)
              }
            >
              <SwitchThumb />
            </Switch>
          </div>
        </Flex>

        <Typography css={{ fontWeight: 600, mt: '$5' }} size="h4">
          Mailjet configuration
        </Typography>
        <Typography size="subheading" css={{ color: '$gray9', mt: '$2' }}>
          The Mailjet API is used for bulk email newsletter delivery. To send
          your first newsletter, you need to create an account on Mailjet and
          enter the information in the inputs below.
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
            value={formik.values.apiKey}
            onChange={formik.handleChange}
          />
          {formik.errors.apiKey && (
            <FormHelperError>{formik.errors.apiKey}</FormHelperError>
          )}
        </FormRow>

        <Typography css={{ fontWeight: 600, mt: '$5' }} size="h4">
          API Secret
        </Typography>
        <FormRow css={{ mt: '$2', mb: '$2' }}>
          <FormInput
            name="apiSecret"
            type="text"
            placeholder="Enter your Mailjet’s API secret"
            value={formik.values.apiSecret}
            onChange={formik.handleChange}
          />
          {formik.errors.apiSecret && (
            <FormHelperError>{formik.errors.apiSecret}</FormHelperError>
          )}
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

        {formik.dirty && (
          <UnsavedChanges
            saving={formik.isSubmitting || isLoadingUpdateNewsletter}
          />
        )}
      </form>
    </SettingsLayout>
  );
};
