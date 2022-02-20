module.exports = {
  purge: ['./src/**/*.{js,ts,jsx,tsx}'],
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
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
