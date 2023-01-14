import { createStitches } from '@stitches/react';
import type * as Stitches from '@stitches/react';

const gray = {
  gray1: '#fcfcfc',
  gray2: '#f6f6f6',
  gray3: '#f3f3f3',
  gray4: '#ededed',
  gray5: '#e8e8e8',
  gray6: '#e2e2e2',
  gray7: '#dbdbdb',
  gray8: '#c7c7c7',
  gray9: '#737373',
  gray10: '#2f2f2f',
  gray11: '#1a1a1a',
  gray12: '#080808',
};

const grayDark = {
  gray1: '#1a1a1a',
  gray2: '#202020',
  gray3: '#232323',
  gray4: '#282828',
  gray5: '#2e2e2e',
  gray6: '#343434',
  gray7: '#3e3e3e',
  gray8: '#505050',
  gray9: '#a1a1a1',
  gray10: '#e5e5e5',
  gray11: '#f2f2f2',
  gray12: '#fcfcfc',
};

const indigo = {
  indigo1: '#f5f5ff',
  indigo2: '#ebebff',
  indigo3: '#dfdeff',
  indigo4: '#cfcfff',
  indigo5: '#c1c0ff',
  indigo6: '#b5b1ff',
  indigo7: '#a29dfd',
  indigo8: '#918bff',
  indigo9: '#8075ff',
  indigo10: '#7367ff',
  indigo11: '#6558ff',
  indigo12: '#5345f9',
};

const indigoDark = {
  indigo1: '#0a064a',
  indigo2: '#150f6a',
  indigo3: '#1b1476',
  indigo4: '#1b1789',
  indigo5: '#2c22ba',
  indigo6: '#3a32e0',
  indigo7: '#5154f3',
  indigo8: '#5f62f5',
  indigo9: '#7a7dff',
  indigo10: '#9194ff',
  indigo11: '#a3a4ff',
  indigo12: '#b8baff',
};

export const {
  styled,
  getCssText,
  keyframes,
  config,
  globalCss,
  theme,
  createTheme,
} = createStitches({
  theme: {
    colors: {
      ...gray,
      ...indigo,
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
    },
    lineHeights: {
      xs: '1rem',
      sm: '1.25rem',
      md: '1.5rem',
      lg: '1.75rem',
      xl: '2rem',
      '2xl': '2.25rem',
      '3xl': '2.5rem',
    },
    space: {
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      15: '3.75rem',
      20: '5rem',
    },
    sizes: {
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
    },
    fontWeights: {
      normal: 400,
      semiBold: 500,
      bold: 700,
    },
    radii: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      full: '9999px',
    },
    shadows: {
      sm: '0px 6px 6px -6px rgba(0, 0, 0, 0.16), 0px 0px 1px rgba(0, 0, 0, 0.4)',
      md: '0px 12px 12px -6px rgba(0, 0, 0, 0.16), 0px 0px 1px rgba(0, 0, 0, 0.4)',
      lg: '0px 8px 24px -6px rgba(0, 0, 0, 0.16), 0px 0px 1px rgba(0, 0, 0, 0.4)',
      xl: '0px 32px 32px -8px rgba(0, 0, 0, 0.08), 0px 0px 32px -8px rgba(0, 0, 0, 0.12), 0px 0px 1px rgba(0, 0, 0, 0.2)',
    },
  },
  utils: {
    p: (value: Stitches.PropertyValue<'padding'>) => ({
      paddingTop: value,
      paddingBottom: value,
      paddingLeft: value,
      paddingRight: value,
    }),
    pt: (value: Stitches.PropertyValue<'padding'>) => ({
      paddingTop: value,
    }),
    pr: (value: Stitches.PropertyValue<'padding'>) => ({
      paddingRight: value,
    }),
    pb: (value: Stitches.PropertyValue<'padding'>) => ({
      paddingBottom: value,
    }),
    pl: (value: Stitches.PropertyValue<'padding'>) => ({
      paddingLeft: value,
    }),
    px: (value: Stitches.PropertyValue<'padding'>) => ({
      paddingLeft: value,
      paddingRight: value,
    }),
    py: (value: Stitches.PropertyValue<'padding'>) => ({
      paddingTop: value,
      paddingBottom: value,
    }),

    m: (value: Stitches.PropertyValue<'margin'>) => ({
      marginTop: value,
      marginBottom: value,
      marginLeft: value,
      marginRight: value,
    }),
    mt: (value: Stitches.PropertyValue<'margin'>) => ({
      marginTop: value,
    }),
    mr: (value: Stitches.PropertyValue<'margin'>) => ({
      marginRight: value,
    }),
    mb: (value: Stitches.PropertyValue<'margin'>) => ({
      marginBottom: value,
    }),
    ml: (value: Stitches.PropertyValue<'margin'>) => ({
      marginLeft: value,
    }),
    mx: (value: Stitches.PropertyValue<'margin'>) => ({
      marginLeft: value,
      marginRight: value,
    }),
    my: (value: Stitches.PropertyValue<'margin'>) => ({
      marginTop: value,
      marginBottom: value,
    }),

    br: (value: Stitches.PropertyValue<'borderRadius'>) => ({
      borderRadius: value,
    }),
  },
});

export const darkTheme = createTheme('dark', {
  colors: {
    ...grayDark,
    ...indigoDark,
  },
  shadows: {
    sm: '0px 6px 6px -6px rgba(0, 0, 0, 0.64), 0px 0px 1px rgba(0, 0, 0, 0.56)',
    md: '0px 12px 12px -6px rgba(0, 0, 0, 0.64), 0px 0px 1px rgba(0, 0, 0, 0.56)',
    lg: '0px 24px 24px -6px rgba(0, 0, 0, 0.64), 0px 0px 1px rgba(0, 0, 0, 0.56)',
    xl: '0px 48px 48px -6px rgba(0, 0, 0, 0.88), 0px 0px 1px rgba(0, 0, 0, 0.72)',
  },
});

export type CSS = Stitches.CSS<typeof config>;
