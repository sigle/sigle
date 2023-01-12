import { styled } from '@sigle/stitches.config';

export const Button = styled('button', {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '$sm',
  lineHeight: '$sm',
  fontWeight: 600,
  br: '$sm',

  '&:disabled': {
    pointerEvents: 'none',
  },

  defaultVariants: {
    size: 'md',
    variant: 'solid',
    // color: 'gray',
  },

  variants: {
    size: {
      sm: {
        height: '$8',
        px: '$3',
      },
      md: {
        height: '$9',
        px: '$4',
      },
      lg: {
        height: '$10',
        px: '$5',
      },
    },
    variant: {
      solid: {
        backgroundColor: '$gray11',
        color: '$gray1',
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
      outline: {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '$gray11',
        color: '$gray11',
        '&:hover': {
          borderColor: '$gray12',
          color: '$gray12',
          backgroundColor: '$gray5',
        },
        '&:active': {
          borderColor: '$gray10',
          color: '$gray10',
          backgroundColor: '$gray4',
        },
        '&:disabled': {
          borderColor: '$gray7',
          color: '$gray7',
        },
      },
      ghost: {
        color: '$gray11',
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
  },
});
