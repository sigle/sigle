import { styled } from '../stitches.config';

export const Text = styled('p', {
  fontFamily: '$merri',

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
    },
    color: {
      orange: {
        color: '$orange11',
      },
    },
  },
  defaultVariants: { size: 'md' },
});
