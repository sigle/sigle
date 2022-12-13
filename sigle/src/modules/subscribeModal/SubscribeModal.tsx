import { FormikErrors, useFormik } from 'formik';
import Image from 'next/image';
import { useState } from 'react';
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
  Typography,
} from '../../ui';
import { isValidEmail } from '../../utils/regex';

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
  // temp state to show success state of form
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
    onSubmit: async (values, { setSubmitting, validateForm }) => {
      validateForm();
      formik.resetForm({ values: { ...values } });
      setSuccess(true);
      setSubmitting(false);
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
              css={{ fontWeight: 600, mt: '$4', textAlign: 'center' }}
              size="h3"
            >
              {success ? `Successfully subscribed!` : userInfo.siteName}
            </Typography>
          </DialogTitle>
          <DialogDescription asChild>
            <Typography
              css={{ mt: '$1', mb: '$6', textAlign: 'center' }}
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
                css={{ width: '100%' }}
                type="email"
                placeholder="johndoe@gmail.com"
              />
              {formik.errors.email && !formik.values.email && (
                <FormHelperError css={{ mt: '$2' }}>
                  {formik.errors.email}
                </FormHelperError>
              )}
              <Flex gap="5" css={{ mt: '$6', alignSelf: 'end' }}>
                <Button
                  size="lg"
                  variant="ghost"
                  color="gray"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  disabled={formik.isSubmitting}
                  type="submit"
                  size="lg"
                  color="orange"
                >
                  Subscribe
                </Button>
              </Flex>
            </>
          )}
        </Flex>
      </DialogContent>
    </Dialog>
  );
};
