import { FormikErrors, useFormik } from 'formik';
import { useState } from 'react';
// import { EnvelopePlusIcon } from '../../icons/EnvelopePlusIcon';
import {
  Button,
  Flex,
  FormControlGroup,
  FormHelperError,
  FormInput,
  Typography,
} from '../../ui';
import { useFeatureFlags } from '../../utils/featureFlags';
import { isValidEmail } from '../../utils/regex';
import { toast } from 'react-toastify';
import { useCreateSubscribers } from '../../hooks/subscribers';
import { ApiError } from '../../external/api';

interface NewsletterFrameProps {
  stacksAddress: string;
  siteName: string | undefined;
}

export const NewsletterFrame = ({
  stacksAddress,
  siteName,
}: NewsletterFrameProps) => {
  // temp state to show success state of form
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { isExperimentalNewsletterEnabled } = useFeatureFlags();

  const formik = useFormik<{ email: string }>({
    initialValues: {
      // values to be updated once we have data coming from server
      email: '',
    },
    validate: (values) => {
      const errors: FormikErrors<{ email: string }> = {};

      if (!values.email) {
        errors.email = 'No email has been entered';
      }

      if (values.email && values.email.length > 100) {
        errors.email = 'Name too long';
      }

      if (values.email && !isValidEmail(values.email)) {
        errors.email = 'Invalid email, enter a new one.';
      }

      return errors;
    },
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values, { setErrors, validateForm }) => {
      setErrors({});
      validateForm();
      try {
        createSubscribers({ stacksAddress, email: values.email });
      } catch (error) {
        console.error(error);
        toast.error(error);
      }
    },
  });

  const { mutate: createSubscribers } = useCreateSubscribers({
    onSuccess: () => {
      toast.success(`You successfully subscribed to ${siteName}'s newsletter`, {
        autoClose: 7000,
      });
      formik.setSubmitting(false);
      setIsSubscribed(true);
    },
    onError: (error: Error | ApiError) => {
      let errorMessage = error.message;
      if (error instanceof ApiError && error.body.message) {
        errorMessage = error.body.message;
      }
      formik.setErrors({ email: errorMessage });
      formik.setSubmitting(false);
    },
  });

  return (
    <Flex direction="column" gap="7">
      {isExperimentalNewsletterEnabled && (
        <>
          {isSubscribed ? (
            <Flex direction="column" align="center">
              <Typography size="subheading">{`You have subscribed to ${siteName}'s newsletter.`}</Typography>
              {/* <Button
                css={{ gap: '$1' }}
                color="orange"
                variant="outline"
                onClick={() => {
                  setIsSubscribed(false);
                  toast.success(
                    `You successfully unsubscribed from ${siteName}'s newsletter`,
                    {
                      autoClose: 7000,
                    }
                  );
                }}
              >
                <EnvelopePlusIcon />
                Unsubscribe
              </Button> */}
            </Flex>
          ) : (
            <Flex
              as="form"
              onSubmit={formik.handleSubmit}
              direction="column"
              align="center"
              css={{
                backgroundColor: '$gray2',
                py: '$8',
                br: 20,
              }}
            >
              <Typography css={{ fontWeight: 600, my: 0 }} size="h4">
                Ready for more?
              </Typography>
              <Typography
                size="subheading"
                css={{ my: 0, mb: '$5' }}
              >{`Subscribe to ${siteName} and receive all of their stories directly in your mailbox`}</Typography>
              <FormControlGroup>
                <FormInput
                  name="email"
                  type="email"
                  autoComplete="off"
                  maxLength={100}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  placeholder="johndoe@gmail.com"
                />
                <Button type="submit" size="lg">
                  Subscribe
                </Button>
              </FormControlGroup>
              {formik.errors.email && (
                <FormHelperError
                  css={{
                    mt: '$2',
                    mb: 0,
                  }}
                >
                  {formik.errors.email}
                </FormHelperError>
              )}
            </Flex>
          )}
        </>
      )}
    </Flex>
  );
};
