import { FormikErrors, useFormik } from 'formik';
import { useEffect, useState } from 'react';
// import { EnvelopePlusIcon } from '../../icons/EnvelopePlusIcon';
import { toast } from 'sonner';
import { useSubscribersControllerCreate } from '@/__generated__/sigle-api';
import {
  Button,
  Flex,
  FormControlGroup,
  FormHelperError,
  FormInput,
  LoadingSpinner,
  Typography,
} from '../../ui';
import { isValidEmail } from '../../utils/regex';

interface NewsletterFrameProps {
  stacksAddress: string;
  siteName: string | undefined;
  email?: string;
}

export const NewsletterFrame = ({
  stacksAddress,
  siteName,
  email,
}: NewsletterFrameProps) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const formik = useFormik<{ email: string }>({
    initialValues: {
      email: email || '',
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
      createSubscribers({ body: { stacksAddress, email: values.email } });
    },
  });

  const { mutate: createSubscribers, isLoading: isLoadingCreateSubscriber } =
    useSubscribersControllerCreate({
      onSuccess: () => {
        toast.success(
          `You successfully subscribed to ${siteName}'s newsletter`,
          {
            duration: 7000,
          },
        );
        formik.setSubmitting(false);
        setIsSubscribed(true);
      },
      onError: (error) => {
        formik.setErrors({ email: error?.message });
        formik.setSubmitting(false);
      },
    });

  useEffect(() => {
    if (email) {
      formik.setValues({ email });
    }
  }, [email]);

  return (
    <Flex direction="column" gap="7">
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
            px: '$4',
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
          <FormControlGroup
            css={{
              width: '100%',
              justifyContent: 'center',
              '@lg': {
                maxWidth: '410px',
              },
            }}
          >
            <FormInput
              css={{
                minWidth: 'auto !important',
                width: '100%',
              }}
              name="email"
              type="email"
              autoComplete="off"
              maxLength={100}
              value={formik.values.email}
              onChange={formik.handleChange}
              disabled={!!email}
              placeholder="johndoe@gmail.com"
            />
            {isLoadingCreateSubscriber ? (
              <Button type="submit" size="lg" disabled>
                &nbsp;
                <LoadingSpinner />
              </Button>
            ) : (
              <Button type="submit" size="lg">
                Subscribe
              </Button>
            )}
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
    </Flex>
  );
};
