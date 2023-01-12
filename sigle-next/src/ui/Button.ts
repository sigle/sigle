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
