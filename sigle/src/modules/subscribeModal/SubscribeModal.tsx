import { FormikErrors, useFormik } from 'formik';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ApiError } from '../../external/api';
import { useCreateSubscribers } from '../../hooks/subscribers';
import { styled } from '../../stitches.config';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Flex,
  FormHelperError,
  FormInput,
  LoadingSpinner,
  Typography,
} from '../../ui';
import { isValidEmail } from '../../utils/regex';
import { useUserControllerGetUserMe } from '@/__generated__/sigle-api';

const HeaderLogoContainer = styled('div', {
  mx: 'auto',
  width: 64,
  height: 64,
  display: 'flex',
  justifyContent: 'center',
  br: '$4',
  overflow: 'hidden',
  mb: '$2',
});

const HeaderLogo = styled('img', {
  width: 'auto',
  height: '100%',
  maxWidth: 64,
  maxHeight: 64,
  objectFit: 'cover',
});

interface SettingsFormValues {
  email: string;
}

interface SubscribeModalProps {
  open: boolean;
  onClose: () => void;
  userInfo: {
    siteName: string | undefined;
    address: string;
    siteLogo: string;
  };
}

export const SubscribeModal = ({
  userInfo,
  open,
  onClose,
}: SubscribeModalProps) => {
  const { status } = useSession();
  const { data: userMe } = useUserControllerGetUserMe(
    {},
    {
      enabled: status === 'authenticated',
      refetchOnMount: false,
    },
  );
  const [success, setSuccess] = useState(false);
  const formik = useFormik<SettingsFormValues>({
    initialValues: {
      email: '',
    },
    validate: (values) => {
      const errors: FormikErrors<SettingsFormValues> = {};

      if (!values.email) {
        errors.email = 'No email has been entered';
      }
      if (values.email && !isValidEmail(values.email)) {
        errors.email = 'Invalid email, enter a new one.';
      }

      return errors;
    },
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: async (values, { validateForm, setErrors }) => {
      setErrors({});
      validateForm();
      createSubscribers({
        stacksAddress: userInfo.address,
        email: values.email,
      });
    },
  });

  useEffect(() => {
    if (userMe && userMe.email && userMe.emailVerified) {
      formik.setFieldValue('email', userMe.email);
    }
  }, [userMe]);

  const { mutate: createSubscribers, isLoading: isLoadingCreateSubscriber } =
    useCreateSubscribers({
      onSuccess: () => {
        setSuccess(true);
        formik.setSubmitting(false);
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent css={{ p: '$5', br: 28 }} closeButton={success}>
        <Flex
          direction="column"
          css={{
            alignItems: success ? 'center' : 'start',
          }}
          onSubmit={formik.handleSubmit}
          as="form"
        >
          {success ? (
            <Flex css={{ mb: '$4' }} justify="center">
              <Image
                src="/static/img/success.gif"
                alt="Success GIF"
                width={92}
                height={92}
              />
            </Flex>
          ) : (
            <HeaderLogoContainer>
              <HeaderLogo
                src={userInfo.siteLogo}
                alt={`${userInfo.siteName} logo`}
              />
            </HeaderLogoContainer>
          )}
          <DialogTitle asChild>
            <Typography
              css={{
                fontWeight: 600,
                mt: '$4',
                textAlign: 'center',
                width: '100%',
              }}
              size="h3"
            >
              {success ? `Successfully subscribed!` : userInfo.siteName}
            </Typography>
          </DialogTitle>
          <DialogDescription asChild>
            <Typography
              css={{ mt: '$1', mb: '$6', textAlign: 'center', width: '100%' }}
              size="subheading"
            >
              {success ? (
                <span>
                  {`You just subscribed to ${userInfo.siteName}’s newsletter.`}{' '}
                  <br />
                  See you soon in your mailbox!
                </span>
              ) : (
                `Enter your email to receive ${userInfo.siteName}'s new stories in your 
            mailbox`
              )}
            </Typography>
          </DialogDescription>
          {success ? null : (
            <>
              <FormInput
                name="email"
                maxLength={100}
                value={formik.values.email}
                onChange={formik.handleChange}
                disabled={userMe && !!userMe.email && !!userMe.emailVerified}
                css={{ width: '100%' }}
                type="email"
                placeholder="johndoe@gmail.com"
              />
              {formik.errors.email && (
                <FormHelperError css={{ mt: '$2' }}>
                  {formik.errors.email}
                </FormHelperError>
              )}
              <Flex gap="5" css={{ mt: '$6', alignSelf: 'end' }}>
                <Button
                  size="lg"
                  variant="ghost"
                  color="gray"
                  type="button"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                {isLoadingCreateSubscriber ? (
                  <Button disabled size="lg" color="orange">
                    <LoadingSpinner />
                  </Button>
                ) : (
                  <Button
                    disabled={formik.isSubmitting}
                    type="submit"
                    size="lg"
                    color="orange"
                  >
                    Subscribe
                  </Button>
                )}
              </Flex>
            </>
          )}
        </Flex>
      </DialogContent>
    </Dialog>
  );
};
