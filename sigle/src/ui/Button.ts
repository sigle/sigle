import { styled } from '../stitches.config';

export const Button = styled('button', {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '$2',
  lineHeight: '20.4px',
  whiteSpace: 'nowrap',

  '&:disabled': {
    opacity: 0.5,
    pointerEvents: 'none',
  },

  variants: {
    size: {
      md: {
        px: '$3',
        py: '$1',
        br: '$1',
      },
      lg: {
        px: '$3',
        py: '$2',
        br: '$1',
        '@lg': {
          px: '$4',
          py: '$3',
        },
      },
    },
    color: {
      gray: {
        color: '$gray1',
        backgroundColor: '$gray11',
        '&:hover': {
          backgroundColor: '$gray12',
        },
      },
      orange: {
        color: 'white',
        backgroundColor: '$orange11',
        '&:hover': {
          backgroundColor: '$orange12',
        },
      },
      violet: {
        color: '$gray1',
        backgroundColor: '$violet11',
        '&:hover': {
          backgroundColor: '$violet12',
        },
      },
    },
    variant: {
      solid: {},
      ghost: {
        backgroundColor: 'transparent',
        boxShadow: 'none',
      },
      subtle: {},
      ghostMuted: {
        backgroundColor: 'transparent',
        boxShadow: 'none',
      },
    },
  },
  compoundVariants: [
    {
      color: 'gray',
      variant: 'ghost',
      css: {
        backgroundColor: 'transparent',
        color: '$gray11',
        '&:hover': {
          backgroundColor: '$gray4',
        },
        '&:active': {
          backgroundColor: '$gray5',
        },
      },
    },
    {
      color: 'gray',
      variant: 'ghostMuted',
      css: {
        backgroundColor: 'transparent',
        color: '$gray9',
        '&:hover': {
          backgroundColor: '$gray4',
          color: '$gray11',
        },
        '&:active': {
          backgroundColor: '$gray5',
          color: '$gray11',
        },
      },
    },
    {
      color: 'orange',
      variant: 'ghost',
      css: {
        backgroundColor: 'transparent',
        color: '$orange11',
        '&:hover': {
          backgroundColor: '$orange4',
        },
        '&:active': {
          backgroundColor: '$orange5',
        },
      },
    },
    {
      color: 'gray',
      variant: 'subtle',
      css: {
        backgroundColor: '$gray3',
        color: '$gray11',
        '&:hover': {
          backgroundColor: '$gray4',
        },
        '&:active': {
          backgroundColor: '$gray5',
        },
      },
    },
  ],
  defaultVariants: {
    size: 'md',
    color: 'gray',
    variant: 'solid',
  },
});
