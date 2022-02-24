import { styled } from '../stitches.config';

export const IconButton = styled('button', {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '$2',

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
