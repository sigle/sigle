import { CheckCircledIcon } from '@radix-ui/react-icons';
import { FormikErrors, useFormik } from 'formik';
import { toast } from 'react-toastify';
import { ApiError } from '../../../external/api';
import {
  useAddUserEmail,
  useGetUserMe,
  useResendVerificationUserEmail,
} from '../../../hooks/users';
import {
  Box,
  Flex,
  FormHelper,
  FormHelperError,
  FormInput,
  FormLabel,
  FormRow,
  // Switch,
  // SwitchThumb,
  // Typography,
} from '../../../ui';
import { isValidEmail } from '../../../utils/regex';
import { UnsavedChanges } from '../components/UnsavedChanges';
import { SettingsLayout } from '../SettingsLayout';

interface SettingsFormValues {
  email: string;
  // receiveEmails: boolean;
}

export const EmailData = () => {
  const { data: userMe, refetch: refetchUserMe } = useGetUserMe({
    suspense: true,
  });
  const { mutate: addUserEmail, isLoading: isLoadingAddUserEmail } =
    useAddUserEmail({
      onError: (error: Error | ApiError) => {
        let errorMessage = error.message;
        if (error instanceof ApiError && error.body.message) {
          errorMessage = error.body.message;
        }
        toast.error(errorMessage);
      },
      onSuccess: async () => {
        await refetchUserMe();
        toast.success(
          'Please verify your email by clicking the link sent to your inbox.',
        );
      },
    });
  const {
    mutate: resendVerificationUserEmail,
    isLoading: isLoadingResendVerificationUserEmail,
  } = useResendVerificationUserEmail({
    onError: (error: Error | ApiError) => {
      let errorMessage = error.message;
      if (error instanceof ApiError && error.body.message) {
        errorMessage = error.body.message;
      }
      toast.error(errorMessage);
    },
    onSuccess: async () => {
      await refetchUserMe();
      toast.success(
        'Please verify your email by clicking the link sent to your inbox.',
      );
    },
  });

  // TODO emails settings preferences
  const formik = useFormik<SettingsFormValues>({
    initialValues: {
      email: userMe?.email || '',
      // receiveEmails: false,
    },
    validate: (values) => {
      const errors: FormikErrors<SettingsFormValues> = {};

      if (values.email && !isValidEmail(values.email)) {
        errors.email = 'Invalid email, enter a new one.';
      }

      return errors;
    },
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values, { setSubmitting }) => {
      setSubmitting(false);
      addUserEmail({ email: values.email });
    },
  });

  return (
    <SettingsLayout>
      <Box as="form" onSubmit={formik.handleSubmit} css={{ ml: 1 }}>
        <FormRow>
          <FormLabel>Email</FormLabel>
          <Flex align="center" gap="2" as="span">
            <FormInput
              name="email"
              type="email"
              maxLength={100}
              value={formik.values.email}
              onChange={formik.handleChange}
              placeholder="johndoe@gmail.com"
            />
            {!!userMe?.emailVerified && (
              <Box
                css={{
                  color: '$green11',
                }}
                as="span"
              >
                <CheckCircledIcon />
              </Box>
            )}
          </Flex>
          {formik.errors.email && (
            <FormHelperError>{formik.errors.email}</FormHelperError>
          )}
          {userMe && userMe.email && !userMe.emailVerified && (
            <FormHelper>
              Your email is not verified, please verify it.{' '}
              <Box
                as="a"
                css={{
                  color: '$orange11',
                  boxShadow: '0 1px 0 0',
                  cursor: 'pointer',
                }}
                onClick={() => resendVerificationUserEmail()}
              >
                Resend verification email.
              </Box>
            </FormHelper>
          )}
          <FormHelper>
            Include your email <em>(optional)</em> to stay informed about
            updates and new features from us and quickly subscribe to writers.
            <br />
            Max. 100 Characters
          </FormHelper>
        </FormRow>

        {/* <Flex
          align="center"
          justify="between"
          css={{
            p: '$3',
            backgroundColor: '$gray2',
            br: '$3',
            mb: '$20',
          }}
        >
          <Typography size="subheading">
            Receive transactional emails and updates from Sigle
          </Typography>
          <Switch
            name="receiveEmails"
            checked={formik.values.receiveEmails}
            onCheckedChange={() =>
              formik.setFieldValue(
                'receiveEmails',
                !formik.values.receiveEmails
              )
            }
          >
            <SwitchThumb />
          </Switch>
        </Flex> */}
        {formik.dirty && (
          <UnsavedChanges
            saving={
              formik.isSubmitting ||
              isLoadingAddUserEmail ||
              isLoadingResendVerificationUserEmail
            }
          />
        )}
      </Box>
    </SettingsLayout>
  );
};
