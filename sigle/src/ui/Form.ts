import { styled } from '../stitches.config';

export const FormRow = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$3',
  py: '$3',
});

export const FormLabel = styled('label', {
  width: '100%',
  display: 'block',
  fontSize: '$2',
  color: '$gray11',
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
    '&::before': {
      boxSizing: 'border-box',
    },
    '&::after': {
      boxSizing: 'border-box',
    },

    //custom
    backgroundColor: '$gray3',
    boxShadow: '0 0 0 1px $colors$gray7',
    borderRadius: '$1',
    px: '$2',
    py: '$1',
    fontSize: '$1',
    color: '$gray9',

    '&:focus': {
      boxShadow: '0 0 0 2px $colors$gray8',
    },
  },

  '&::placeholder': {
    color: '$gray9',
  },
});

export const FormInputCheckbox = styled('input', {
  '&[type="checkbox"]': {
    // reset
    all: 'unset',
    //custom
    display: 'block',
    backgroundColor: '$gray3',
    boxShadow: '0 0 0 1px $colors$gray7',
    p: '$2',
    borderRadius: '$1',

    '&:focus': {
      boxShadow: '0 0 0 2px $colors$gray8',
    },
  },
});

export const FormTextarea = styled('textarea', {
  //reset
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
  mt: '$1',
  color: '$gray9',
  fontSize: '$1',
});

export const FormHelperError = styled('p', {
  mt: '$1',
  color: '$orange11',
});
