import { styled } from '../stitches.config';

export const IconButton = styled('button', {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '$2',

  '& svg': {
    color: '$gray11',
  },

  variants: {
    size: {
      sm: {
        p: '$2',
        br: '$1',
      },
      md: {
        p: '$2',
        br: '$1',
      },
    },
    color: {
      gray: {
        color: '$gray11',
        '&:hover': {
          backgroundColor: '$gray4',
        },
        '&:active': {
          backgroundColor: '$gray5',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'gray',
  },
});
