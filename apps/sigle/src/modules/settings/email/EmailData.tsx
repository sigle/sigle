import { CheckCircledIcon } from '@radix-ui/react-icons';
import { FormikErrors, useFormik } from 'formik';
import { toast } from 'sonner';
import { Text, Flex, TextField, Link, Box } from '@radix-ui/themes';
import {
  useUserControllerGetUserMe,
  useEmailVerificationControllerAddEmail,
  useEmailVerificationControllerResendEmail,
} from '@/__generated__/sigle-api';
import { isValidEmail } from '../../../utils/regex';
import { UnsavedChanges } from '../components/UnsavedChanges';
import { SettingsLayout } from '../SettingsLayout';

interface SettingsFormValues {
  email: string;
}

export const EmailData = () => {
  const { data: userMe, refetch: refetchUserMe } = useUserControllerGetUserMe(
    {},
    {
      suspense: true,
    },
  );
  const { mutate: addUserEmail, isLoading: isLoadingAddUserEmail } =
    useEmailVerificationControllerAddEmail({
      onError: (error) => {
        toast.error(error?.message);
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
  } = useEmailVerificationControllerResendEmail({
    onError: (error) => {
      toast.error(error?.message);
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
      addUserEmail({
        body: {
          email: values.email,
        },
      });
    },
  });

  return (
    <SettingsLayout>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Text as="p" size="2" color="gray" highContrast weight="bold">
            Email
          </Text>
          <Flex align="center" gap="2">
            <TextField.Root className="w-full max-w-[300px]">
              <TextField.Input
                name="email"
                type="email"
                maxLength={100}
                value={formik.values.email}
                onChange={formik.handleChange}
                placeholder="johndoe@gmail.com"
              />
            </TextField.Root>
            {!!userMe?.emailVerified && <CheckCircledIcon />}
          </Flex>
          {formik.errors.email && (
            <Text as="p" size="2" color="red">
              {formik.errors.email}
            </Text>
          )}
          {userMe && userMe.email && !userMe.emailVerified && (
            <Text as="p" size="1" color="gray">
              Your email is not verified, please verify it.{' '}
              <Link
                color="orange"
                onClick={() => resendVerificationUserEmail({})}
              >
                Resend verification email.
              </Link>
            </Text>
          )}
          <Text as="p" size="1" color="gray">
            Include your email <em>(optional)</em> to stay informed about
            updates and new features from us and quickly subscribe to writers.
            <br />
            Max. 100 Characters
          </Text>
        </div>
        {formik.dirty && (
          <UnsavedChanges
            saving={
              formik.isSubmitting ||
              isLoadingAddUserEmail ||
              isLoadingResendVerificationUserEmail
            }
          />
        )}
      </form>
    </SettingsLayout>
  );
};
