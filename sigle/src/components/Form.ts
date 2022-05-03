import styled from 'styled-components';
import tw from 'twin.macro';

export const FormRow = styled.div`
  ${tw`py-3`};
`;

export const FormLabel = styled.label`
  ${tw`w-full block tracking-wide font-bold mb-2`};
`;

export const FormInput = styled.input`
  ${tw`block w-full bg-white dark:text-black border border-grey rounded py-3 px-3 text-sm leading-tight focus:border-grey-dark focus:ring-grey-dark`};
`;

export const FormInputCheckbox = styled.input`
  ${tw`block bg-white border border-grey rounded py-2 px-2 text-sm leading-tight focus:border-grey-dark focus:ring-grey-dark`};
`;

export const FormTextarea = styled.textarea`
  ${tw`block w-full bg-white dark:text-black border border-grey rounded py-3 px-3 text-sm leading-tight focus:border-grey-dark focus:ring-grey-dark`};
`;

export const FormHelper = styled.p`
  ${tw`text-sm text-grey-darker mt-1`};
`;

export const FormHelperError = styled.p`
  ${tw`text-sm text-pink mt-1`};
`;
