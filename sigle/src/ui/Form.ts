import { styled } from '../stitches.config';
import { Button } from './Button';

export const FormRow = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  gap: '$2',
  mb: '$5',
});

export const FormLabel = styled('label', {
  width: '100%',
  display: 'block',
  fontSize: '18px',
  lineHeight: '24px',
  fontWeight: 600,
  color: '$gray11',
});

export const FormInput = styled('input', {
  '&[type]': {
    appearance: 'none',
    borderWidth: '0',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    margin: '0',
    outline: 'none',
    padding: '0',
    minWidth: 300,
    WebkitTapHighlightColor: 'rgba(0,0,0,0)',
    backgroundColor: '$gray3',
    boxShadow: '0 0 0 1px $colors$gray7',
    ml: '1px',
    mr: '1px',
    br: '$3',
    px: '$2',
    py: '$1',
    fontSize: '$1',
    color: '$gray11',

    '&:hover': {
      backgroundColor: '$gray4',
      boxShadow: '0 0 0 1px $colors$gray8',
    },

    '&:focus': {
      backgroundColor: '$gray4',
      boxShadow: '0 0 0 1px $colors$gray8',
    },

    '&::placeholder': {
      color: '$gray9',
    },
  },

  '&[type="date"]::-webkit-calendar-picker-indicator': {
    background: 'url(/static/img/Calendar.svg) no-repeat',
    mt: '$1',
  },
});

export const FormControlGroup = styled('div', {
  display: 'flex',
  boxShadow: '0 0 0 1px $colors$gray7',
  br: '$3',

  // Make sure ControlGroup and its children don't affect normal stacking order
  position: 'relative',
  zIndex: 0,

  [`& ${Button}`]: {
    br: 0,
    '&:first-child': {
      borderTopLeftRadius: '$3',
      borderBottomLeftRadius: '$3',
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },

    '&:last-child': {
      borderTopRightRadius: '$3',
      borderBottomRightRadius: '$3',
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
  },

  [`& ${FormInput}`]: {
    br: 0,
    boxShadow: 'none',
    '&:focus': {
      zIndex: 1,
    },

    '&:first-child': {
      borderTopLeftRadius: '$3',
      borderBottomLeftRadius: '$3',
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },

    '&:last-child': {
      borderTopRightRadius: '$3',
      borderBottomRightRadius: '$3',
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
  },
});

export const FormTextarea = styled('textarea', {
  outline: 'none',
  minWidth: 300,
  backgroundColor: '$gray3',
  boxShadow: '0 0 0 1px $colors$gray7',
  br: '$3',
  py: '$2',
  px: '$2',
  fontSize: '$1',

  '&:hover': {
    backgroundColor: '$gray4',
    boxShadow: '0 0 0 1px $colors$gray8',
  },

  '&:focus': {
    backgroundColor: '$gray4',
    boxShadow: '0 0 0 1px $colors$gray8',
  },

  '&::placeholder': {
    color: '$gray9',
  },
});

export const FormHelper = styled('p', {
  color: '$gray9',
  fontSize: '$1',
});

export const FormHelperError = styled('p', {
  fontSize: '$1',
  color: '$red11',
});
