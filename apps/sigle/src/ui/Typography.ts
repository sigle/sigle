import { styled } from '../stitches.config';

export const Typography = styled('p', {
  variants: {
    size: {
      display1: {
        fontSize: '48px',
        lineHeight: '62px',
        letterSpacing: '-0.3px',

        '@lg': {
          fontSize: '72px',
          lineHeight: '84px',
        },
      },
      display2: {
        fontSize: '38px',
        lineHeight: '48px',
        letterSpacing: '-0.3px',

        '@lg': {
          fontSize: '48px',
          lineHeight: '62px',
        },
      },
      h1: {
        fontSize: '32px',
        lineHeight: '40px',
        letterSpacing: '-0.3px',

        '@lg': {
          fontSize: '36px',
          lineHeight: '42px',
        },
      },
      h2: {
        fontSize: '24px',
        lineHeight: '28px',

        '@lg': {
          fontSize: '30px',
          lineHeight: '40px',
        },
      },
      h3: {
        fontSize: '20px',
        lineHeight: '24px',

        '@lg': {
          fontSize: '22px',
          lineHeight: '28px',
        },
      },
      h4: {
        fontSize: '15px',
        lineHeight: 'normal',

        '@lg': {
          fontSize: '18px',
          lineHeight: '24px',
        },
      },
      subheading: {
        fontSize: '13px',
        lineHeight: '16px',

        '@lg': {
          fontSize: '15px',
          lineHeight: '20px',
        },
      },
      paragraph: {
        fontSize: '16px',
        lineHeight: '26px',
        letterSpacing: '0.2px',

        '@lg': {
          fontSize: '18px',
          lineHeight: '28.8px',
        },
      },
      subparagraph: {
        fontSize: '13px',
        lineHeight: '16px',
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
      green: {
        color: '$green11',
      },
    },
  },
  defaultVariants: {
    size: 'paragraph',
    color: 'gray',
  },
});
