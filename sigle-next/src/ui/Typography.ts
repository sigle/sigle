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
      indigo: {
        color: '$indigo11',
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
  },
  defaultVariants: {
    size: 'paragraph',
    color: 'gray',
  },
});
