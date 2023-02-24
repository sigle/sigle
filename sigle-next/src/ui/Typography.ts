import { styled } from '@sigle/stitches.config';

export const Typography = styled('p', {
  variants: {
    size: {
      xs: {
        fontSize: '$xs',
        lineHeight: '$xs',
      },
      sm: {
        fontSize: '$sm',
        lineHeight: '$sm',
      },
      md: {
        fontSize: '$md',
        lineHeight: '$md',
      },
      lg: {
        fontSize: '$lg',
        lineHeight: '$lg',
      },
      xl: {
        fontSize: '$xl',
        lineHeight: '$xl',
      },
      '2xl': {
        fontSize: '$2xl',
        lineHeight: '$2xl',
      },
      '3xl': {
        fontSize: '$3xl',
        lineHeight: '$3xl',
      },
    },
    color: {
      gray: {
        color: '$gray11',
      },
      gray9: {
        color: '$gray9',
      },
      indigo: {
        color: '$indigo11',
      },
      orange: {
        color: '$orange11',
      },
    },
    fontWeight: {
      normal: {
        fontWeight: '$normal',
      },
      semiBold: {
        fontWeight: '$semiBold',
      },
      bold: {
        fontWeight: '$bold',
      },
    },
    textTransform: {
      uppercase: {
        textTransform: 'uppercase',
      },
    },
    lineClamp: {
      1: {
        display: '-webkit-box',
        '-webkit-line-clamp': 1,
        '-webkit-box-orient': 'vertical',
        overflow: 'hidden',
      },
      2: {
        display: '-webkit-box',
        '-webkit-line-clamp': 2,
        '-webkit-box-orient': 'vertical',
        overflow: 'hidden',
      },
      3: {
        display: '-webkit-box',
        '-webkit-line-clamp': 3,
        '-webkit-box-orient': 'vertical',
        overflow: 'hidden',
      },
    },
  },
  defaultVariants: {
    size: 'paragraph',
    color: 'gray',
  },
});
