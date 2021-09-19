import { styled } from '../stitches.config';

export const Button = styled('button', {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '$2',

  variants: {
    size: {
      md: {
        px: '$3',
        py: '$1',
        br: '$1',
      },
      lg: {
        px: '$4',
        py: '$3',
        br: '$1',
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
        backgroundColor: '$orange9',
        '&:hover': {
          backgroundColor: '$orange10',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'gray',
  },
});
