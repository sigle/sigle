import { styled } from '../stitches.config';

/**
 * @deprecated Use `Typography` instead.
 */
export const Text = styled('p', {
  variants: {
    size: {
      xs: {
        fontSize: '$1',
        color: '$gray9',
        letterSpacing: '0.2px',
        lineHeight: '18px',
      },
      sm: {
        fontSize: '$2',
        color: '$gray9',
        letterSpacing: '0.2px',
        lineHeight: '20.4px',
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
        lineHeight: '20.4px',
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
