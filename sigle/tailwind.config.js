module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        openSans: 'Open Sans',
        baskerville: "'Libre Baskerville', serif",
      },
      colors: {
        grey: {
          darker: '#838383',
          dark: '#bbbaba',
          DEFAULT: '#ededed',
          light: '#f7f7f7',
        },
        pink: {
          DEFAULT: '#ff576a',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            'code::before': {
              content: '',
            },
            'code::after': {
              content: '',
            },
            code: {
              fontWeight: '400',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
