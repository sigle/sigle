import { styled } from '../stitches.config';

export const IconButton = styled('button', {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '$2',
  br: '$3',

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  variants: {
    size: {
      sm: {
        width: 28,
        height: 28,
      },
      md: {
        width: 36,
        height: 36,
      },
      lg: {
        width: 44,
        height: 44,
      },
    },
    color: {
      gray: {
        color: '$gray11',
        backgroundColor: '$gray3',
        '&:hover': {
          backgroundColor: '$gray5',
        },
        '&:active': {
          backgroundColor: '$gray4',
        },
      },
      orange: {
        color: '$orange11',
        backgroundColor: '$orange3',
        '&:hover': {
          backgroundColor: '$orange5',
        },
        '&:active': {
          backgroundColor: '$orange4',
        },
      },
    },
    variant: {
      solid: {},
      outline: {},
      ghost: {
        backgroundColor: 'transparent',
      },
    },
  },
  compoundVariants: [
    {
      color: 'gray',
      variant: 'ghost',
      css: {
        backgroundColor: 'transparent',
      },
    },
    {
      color: 'gray',
      variant: 'outline',
      css: {
        backgroundColor: 'transparent',
        boxShadow: '0 0 0 1px $colors$gray11',
      },
    },
    {
      color: 'gray',
      variant: 'solid',
      css: {
        color: '$gray1',
        backgroundColor: '$gray11',
        '&:hover': {
          backgroundColor: '$gray12',
        },
        '&:active': {
          backgroundColor: '$gray10',
        },
      },
    },
    {
      color: 'orange',
      variant: 'ghost',
      css: {
        backgroundColor: 'transparent',
      },
    },
    {
      color: 'orange',
      variant: 'outline',
      css: {
        backgroundColor: 'transparent',
        boxShadow: '0 0 0 1px $colors$orange11',
      },
    },
    {
      color: 'orange',
      variant: 'solid',
      css: {
        color: 'white',
        backgroundColor: '$orange11',
        '&:hover': {
          backgroundColor: '$orange12',
        },
        '&:active': {
          backgroundColor: '$orange10',
        },
      },
    },
  ],
  defaultVariants: {
    size: 'md',
    color: 'gray',
    variant: 'ghost',
  },
});
