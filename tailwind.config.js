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
      primary: {
        default: '#ff576a',
      },
      grey: {
        darker: '#494949',
        dark: '#cccccc',
        default: '#e8e8e8',
        light: '#f9f9f9',
      },
    },
  },
};
