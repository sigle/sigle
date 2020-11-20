module.exports = {
  purge: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        roboto: "'Roboto', sans-serif",
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
          default: '#ff576a',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
