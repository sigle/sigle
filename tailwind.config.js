module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
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
          default: '#ededed',
          light: '#f7f7f7',
        },
        pink: {
          default: '#ff576a',
        },
      },
    },
  },
};
