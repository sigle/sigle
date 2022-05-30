import { styled } from '../stitches.config';

export const Typography = styled('p', {
  variants: {
    size: {
      display1: {
        fontSize: '72px',
        lineHeight: '84px',
        letterSpacing: '-0.3px',
      },
      display2: {
        fontSize: '48px',
        lineHeight: '62px',
        letterSpacing: '-0.3px',
      },
      h1: {
        fontSize: '36px',
        lineHeight: '42px',
        letterSpacing: '-0.3px',
      },
      h2: {
        fontSize: '30px',
        lineHeight: '40px',
        letterSpacing: '-0.3px',
      },
      h3: {
        fontSize: '22px',
        lineHeight: '28px',
      },
      h4: {
        fontSize: '18px',
        lineHeight: '24px',
      },
      subheading: {
        fontSize: '15px',
        lineHeight: '20px',
      },
      paragraph: {
        fontSize: '18px',
        lineHeight: '28.8px',
        letterSpacing: '0.2px',
      },
      subparagraph: {
        fontSize: '14px',
        lineHeight: '18px',
        letterSpacing: '0.2px',
      },
    },
  },
  defaultVariants: {
    size: 'paragraph',
  },
});
