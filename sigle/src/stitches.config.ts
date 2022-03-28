import type * as Stitches from '@stitches/react';
import { createStitches } from '@stitches/react';

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

const orange = {
  orange1: '#FFF9F6',
  orange2: '#FFF1EC',
  orange3: '#FFE9E1',
  orange4: '#FFE0D5',
  orange5: '#FFD6C7',
  orange6: '#FFC8B4',
  orange7: '#FFB79D',
  orange8: '#FF9873',
  orange9: '#F9703E',
  orange10: '#E9531D',
  orange11: '#DA3A00',
  orange12: '#CC3600',
};

const orangeDark = {
  orange1: '#1D0900',
  orange2: '#2C1004',
  orange3: '#391505',
  orange4: '#4C1D08',
  orange5: '#572109',
  orange6: '#6D2607',
  orange7: '#812E0A',
  orange8: '#A33D10',
  orange9: '#BC410D',
  orange10: '#CA470F',
  orange11: '#F76808',
  orange12: '#FF802B',
};

const red = {
  red11: '#F43939',
};

const redDark = {
  red11: '#FF6C6C',
};

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  createTheme,
  config,
} = createStitches({
  theme: {
    colors: {
      ...gray,
      ...orange,
      ...red,
    },
    fonts: {
      openSans: "'Open Sans', sans-serif",
      monaco: "'Monaco', monospace",
    },
    space: {
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      7: '28px',
      8: '32px',
      9: '36px',
      10: '40px',
      15: '60px',
      20: '80px',
    },
    sizes: {
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      7: '28px',
      8: '32px',
      9: '36px',
      10: '40px',
    },
    fontSizes: {
      1: '13px',
      2: '15px',
      3: '16px',
      4: '21px',
      5: '24px',
      6: '30px',
      7: '36px',
      8: '48px',
      9: '72px',
    },
    radii: {
      1: '4px',
      2: '6px',
      3: '8px',
      4: '12px',
      round: '50%',
    },
  },
  media: {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    '2xl': '(min-width: 1536px)',
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
    ...orangeDark,
    ...redDark,
  },
});

export type CSS = Stitches.CSS<typeof config>;
