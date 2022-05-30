import { styled } from '../stitches.config';

/**
 * @deprecated Use `Typography` instead.
 */
export const Heading = styled('p', {
  fontWeight: 700,
  color: '$gray11',

  variants: {
    size: {
      lg: {
        fontSize: '$4',
      },
      xl: {
        fontSize: '$5',
      },
      '2xl': {
        fontSize: '$6',
        letterSpacing: '-0.3px',
        lineHeight: '36px',
      },
      '3xl': {
        fontSize: '$7',
        letterSpacing: '-0.3px',
        lineHeight: '43px',
      },
      '4xl': {
        fontSize: '$8',
        letterSpacing: '-0.3px',
        lineHeight: '58px',
      },
      '5xl': {
        fontSize: '$9',
        letterSpacing: '-0.3px',
        lineHeight: '86px',
      },
    },
  },
  defaultVariants: { size: 'lg' },
});
