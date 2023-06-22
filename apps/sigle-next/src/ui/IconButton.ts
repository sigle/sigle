import { styled } from '@sigle/stitches.config';

export const IconButton = styled('button', {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '$md',
  br: '$sm',

  '&:disabled': {
    pointerEvents: 'none',
  },

  defaultVariants: {
    size: 'md',
    variant: 'solid',
    color: 'gray',
  },

  variants: {
    size: {
      xs: {
        height: '$5',
        width: '$5',
      },
      sm: {
        height: '$8',
        width: '$8',
      },
      md: {
        height: '$9',
        width: '$9',
      },
      lg: {
        height: '$10',
        width: '$10',
      },
    },
    variant: {
      solid: {
        color: '$gray1',
        backgroundColor: '$gray11',
        '&:hover': {
          backgroundColor: '$gray12',
        },
        '&:active': {
          backgroundColor: '$gray10',
        },
        '&:disabled': {
          backgroundColor: '$gray7',
        },
      },
      light: {
        color: '$gray11',
        backgroundColor: '$gray3',
        '&:hover': {
          color: '$gray12',
          backgroundColor: '$gray5',
        },
        '&:active': {
          color: '$gray10',
          backgroundColor: '$gray4',
        },
        '&:disabled': {
          color: '$gray9',
          backgroundColor: '$gray3',
        },
      },
      outline: {
        color: '$gray11',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '$gray11',
        '&:hover': {
          color: '$gray12',
          backgroundColor: '$gray5',
          borderColor: '$gray12',
        },
        '&:active': {
          color: '$gray10',
          backgroundColor: '$gray4',
          borderColor: '$gray10',
        },
        '&:disabled': {
          color: '$gray7',
          borderColor: '$gray7',
        },
      },
      ghost: {
        color: '$gray11',
        backgroundColor: 'transparent',
        '&:hover': {
          color: '$gray12',
          backgroundColor: '$gray5',
        },
        '&:active': {
          color: '$gray10',
          backgroundColor: '$gray4',
        },
        '&:disabled': {
          color: '$gray9',
        },
      },
    },
    color: {
      gray: {},
      indigo: {},
    },
  },
  compoundVariants: [
    {
      variant: 'solid',
      color: 'indigo',
      css: {
        backgroundColor: '$indigo11',
        '&:hover': {
          backgroundColor: '$indigo12',
        },
        '&:active': {
          backgroundColor: '$indigo10',
        },
        '&:disabled': {
          backgroundColor: '$indigo7',
        },
      },
    },
    {
      variant: 'light',
      color: 'indigo',
      css: {
        color: '$indigo11',
        backgroundColor: '$indigo3',
        '&:hover': {
          color: '$indigo12',
          backgroundColor: '$indigo5',
        },
        '&:active': {
          color: '$indigo10',
          backgroundColor: '$indigo4',
        },
        '&:disabled': {
          color: '$indigo9',
          backgroundColor: '$indigo3',
        },
      },
    },
    {
      variant: 'outline',
      color: 'indigo',
      css: {
        color: '$indigo11',
        borderColor: '$indigo11',
        '&:hover': {
          color: '$indigo12',
          backgroundColor: '$indigo5',
          borderColor: '$indigo12',
        },
        '&:active': {
          color: '$indigo10',
          backgroundColor: '$indigo4',
          borderColor: '$indigo10',
        },
        '&:disabled': {
          color: '$indigo7',
          borderColor: '$indigo7',
        },
      },
    },
    {
      variant: 'ghost',
      color: 'indigo',
      css: {
        color: '$indigo11',
        '&:hover': {
          color: '$indigo12',
          backgroundColor: '$indigo5',
        },
        '&:active': {
          color: '$indigo10',
          backgroundColor: '$indigo4',
        },
        '&:disabled': {
          color: '$indigo9',
        },
      },
    },
  ],
});
