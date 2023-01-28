import { CheckCircledIcon } from '@radix-ui/react-icons';
import { FormikErrors, useFormik } from 'formik';
import { useState } from 'react';
import {
  Box,
  Flex,
  FormHelper,
  FormHelperError,
  FormInput,
  FormLabel,
  FormRow,
  Switch,
  SwitchThumb,
  Typography,
} from '../../../ui';
import { isValidEmail } from '../../../utils/regex';
import { UnsavedChanges } from '../components/UnsavedChanges';
import { SettingsLayout } from '../SettingsLayout';

interface SettingsFormValues {
  email: string;
  receiveEmails: boolean;
}

export const EmailData = () => {
  // temp state to show success state of form
  // TODO add values from API
  // TODO emails settings
  const [success, setSuccess] = useState(false);

  const formik = useFormik<SettingsFormValues>({
    initialValues: {
      email: '',
      receiveEmails: false,
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
    onSubmit: async (values, { setSubmitting, validateForm }) => {
      validateForm();
      formik.resetForm({ values: { ...values } });
      setSuccess(true);
      setSubmitting(false);
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
            {success && (
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
          <FormHelper>
            Add your email <em>(optional)</em> to receive updates and feature
            releases from us and subscribe faster to writers. <br />
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
        {formik.dirty && <UnsavedChanges saving={formik.isSubmitting} />}
      </Box>
    </SettingsLayout>
  );
};
