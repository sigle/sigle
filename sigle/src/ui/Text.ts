import { styled } from '../stitches.config';

export const Text = styled('p', {
  variants: {
    size: {
      xs: {
        fontSize: '$1',
        color: '$gray9',
        letterSpacing: '0.2px',
      },
      sm: {
        fontSize: '$2',
        color: '$gray9',
        letterSpacing: '0.2px',
      },
      md: {
        fontSize: '$3',
        letterSpacing: '0.2px',
        lineHeight: '28.8px',
      },
      action: {
        fontFamily: '$lato',
        fontSize: '$2',
        letterSpacing: '0.2px',
      },
    },
    color: {
      gray: {
        color: '$gray10',
      },
      orange: {
        color: '$orange11',
      },
    },
  },
  defaultVariants: { color: 'gray', size: 'md' },
});
