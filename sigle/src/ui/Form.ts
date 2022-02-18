import { styled } from '../stitches.config';

export const FormRow = styled('div', {
  mb: '$5',
});

export const FormLabel = styled('label', {
  width: '100%',
  display: 'block',
  fontSize: '$2',
  color: '$gray11',
  mb: '$3',
});

export const FormInput = styled('input', {
  '&[type]': {
    // reset
    appearance: 'none',
    borderWidth: '0',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    margin: '0',
    outline: 'none',
    padding: '0',
    width: '100%',
    WebkitTapHighlightColor: 'rgba(0,0,0,0)',

    //custom
    backgroundColor: '$gray3',
    boxShadow: '0 0 0 1px $colors$gray7',
    borderRadius: '$1',
    px: '$2',
    py: '$1',
    fontSize: '$1',
    color: '$gray11',

    '&:focus': {
      boxShadow: '0 0 0 2px $colors$gray8',
    },

    '&::placeholder': {
      color: '$gray9',
    },
  },
});

export const FormInputCheckbox = styled('input', {
  '&[type="checkbox"]': {
    all: 'unset',
    display: 'block',
    backgroundColor: '$gray3',
    boxShadow: '0 0 0 1px $colors$gray7',
    p: '$2',
    mt: '$2',
    borderRadius: '$1',

    '&:focus': {
      boxShadow: '0 0 0 2px $colors$gray8',
    },
  },
});

export const FormTextarea = styled('textarea', {
  all: 'unset',
  width: '100%',
  backgroundColor: '$gray3',
  boxShadow: '0 0 0 1px $colors$gray7',
  borderRadius: '$1',
  py: '$2',
  px: '$2',
  fontSize: '$1',

  '&:focus': {
    boxShadow: '0 0 0 2px $colors$gray8',
  },
});

export const FormHelper = styled('p', {
  mt: '$2',
  color: '$gray9',
  fontSize: '$1',
});

export const FormHelperError = styled('p', {
  mt: '$1',
  color: '$orange11',
});
