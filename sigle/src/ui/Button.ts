import { styled } from '../stitches.config';

export const Button = styled('button', {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '$1',
  lineHeight: '20.4px',
  whiteSpace: 'nowrap',
  br: '$3',

  '&:disabled': {
    opacity: 0.5,
    pointerEvents: 'none',
  },

  '@lg': {
    fontSize: '$2',
  },

  variants: {
    size: {
      sm: {
        px: '$3',
        py: '$1',
      },
      md: {
        px: '$4',
        py: '$2',
      },
      lg: {
        px: '$5',
        py: '$3',
      },
    },
    color: {
      gray: {
        color: '$gray1',
        backgroundColor: '$gray11',
        '&:hover': {
          backgroundColor: '$gray12',
        },
        '&:active': {
          backgroundColor: '$gray10',
        },
      },
      orange: {
        color: 'white',
        backgroundColor: '$orange11',
        '&:hover': {
          backgroundColor: '$orange12',
        },
        '&:active': {
          backgroundColor: '$orange10',
        },
      },
      violet: {
        color: '$gray1',
        backgroundColor: '$violet11',
        '&:hover': {
          backgroundColor: '$violet12',
        },
        '&:active': {
          backgroundColor: '$violet10',
        },
      },
      green: {
        color: '$gray1',
        backgroundColor: '$green11',
        '&:hover': {
          backgroundColor: '$green12',
        },
        '&:active': {
          backgroundColor: '$green12',
        },
      },
    },
    variant: {
      solid: {},
      outline: {},
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
          backgroundColor: '$gray5',
        },
        '&:active': {
          backgroundColor: '$gray4',
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
          backgroundColor: '$gray5',
          color: '$gray11',
        },
        '&:active': {
          backgroundColor: '$gray4',
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
          backgroundColor: '$orange5',
        },
        '&:active': {
          backgroundColor: '$orange4',
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
          backgroundColor: '$gray5',
        },
        '&:active': {
          backgroundColor: '$gray4',
        },
      },
    },
    {
      color: 'gray',
      variant: 'outline',
      css: {
        backgroundColor: 'transparent',
        color: '$gray11',
        boxShadow: '0 0 0 1px $colors$gray11',
        '&:hover': {
          backgroundColor: '$gray5',
        },
        '&:active': {
          backgroundColor: '$gray4',
        },
      },
    },
    {
      color: 'orange',
      variant: 'outline',
      css: {
        backgroundColor: 'transparent',
        color: '$orange11',
        boxShadow: '0 0 0 1px $colors$orange11',
        '&:hover': {
          backgroundColor: '$orange5',
        },
        '&:active': {
          backgroundColor: '$orange4',
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
