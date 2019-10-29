const defaultConfig = require('tailwindcss/stubs/defaultConfig.stub');

module.exports = {
  ...defaultConfig,
  theme: {
    ...defaultConfig.theme,
    fontFamily: {
      ...defaultConfig.theme.fontFamily,
      roboto: "'Roboto', sans-serif",
      baskerville: "'Libre Baskerville', serif",
    },
    colors: {
      ...defaultConfig.theme.colors,
      grey: {
        ...defaultConfig.theme.colors.gray,
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
};
