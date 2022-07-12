import { styled } from '../stitches.config';

export const IconButton = styled('button', {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '$2',

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  variants: {
    size: {
      md: {
        p: '$2',
        br: '$1',
      },
    },
    color: {
      gray: {
        color: '$gray11',
        backgroundColor: '$gray3',
        '&:hover': {
          backgroundColor: '$gray4',
        },
        '&:active': {
          backgroundColor: '$gray5',
        },
      },
    },
    variant: {
      solid: {},
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
  ],
  defaultVariants: {
    size: 'md',
    color: 'gray',
    variant: 'ghost',
  },
});
