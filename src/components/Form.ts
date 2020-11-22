import styled from 'styled-components';
import tw from 'twin.macro';

export const FormRow = styled.div`
  ${tw`py-3`};
`;

export const FormLabel = styled.label`
  ${tw`w-full block tracking-wide font-bold text-black mb-2`};
`;

// TODO Cannot use ring-* in twin.macro, blocked till next release
export const FormInput = styled.input`
  ${tw`block w-full bg-white border border-grey rounded py-3 px-3 text-sm leading-tight ring-grey-dark`};
`;

export const FormTextarea = styled.textarea`
  ${tw`block w-full bg-white border border-grey rounded py-3 px-3 text-sm leading-tight focus:outline-none`};
`;

export const FormHelper = styled.p`
  ${tw`text-sm text-grey-darker mt-1`};
`;

export const FormHelperError = styled.p`
  ${tw`text-sm text-pink mt-1`};
`;
