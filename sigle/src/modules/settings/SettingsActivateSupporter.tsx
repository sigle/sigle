import styled from 'styled-components';
import tw from 'twin.macro';
import { useFormik, FormikErrors } from 'formik';
import { toast } from 'react-toastify';
import { PageTitle } from '../layout/components/DashboardHeader';
import {
  FormHelper,
  FormHelperError,
  FormInput,
  FormLabel,
  FormRow,
} from '../../components/Form';
import { sigleConfig } from '../../config';
import { Button } from '../../components';

const TitleContainer = styled.div`
  ${tw`mt-8 mb-2 py-4 border-b border-solid border-grey`};
`;

const StyledFormRow = styled(FormRow)`
  ${tw`xl:w-1/2`};
`;

const StyledLink = styled.a`
  ${tw`text-pink`}
`;

interface ActivateSupporterFormValues {
  code: string;
}

export const SettingsActivateSupporter = () => {
  const formik = useFormik<ActivateSupporterFormValues>({
    initialValues: {
      code: '',
    },
    validate: (values) => {
      const errors: FormikErrors<ActivateSupporterFormValues> = {};
      if (!values.code) {
        errors.code = 'Code is required';
      }
      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      // TODO do call to backend that link account with username
      toast.success('Supporter account activated');
      setSubmitting(false);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <TitleContainer>
        <PageTitle>Activate supporter account</PageTitle>
        <FormHelper>
          Unblock premium features by becoming a sponsor for{' '}
          <StyledLink href={sigleConfig.buyMeACoffeeUrl} target="_blank">
            5€/month
          </StyledLink>
        </FormHelper>
      </TitleContainer>

      <StyledFormRow>
        <FormLabel>Code</FormLabel>
        <FormInput
          name="code"
          type="text"
          maxLength={10}
          value={formik.values.code}
          onChange={formik.handleChange}
        />
        <FormHelper>Enter the code you received by email</FormHelper>
        {formik.errors.code && (
          <FormHelperError>{formik.errors.code}</FormHelperError>
        )}
      </StyledFormRow>

      <Button disabled={formik.isSubmitting} type="submit">
        {formik.isSubmitting ? 'Sending...' : 'Send'}
      </Button>
    </form>
  );
};
