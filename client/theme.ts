const colors = {
  primary: '#FF576A',
  black: '#000000',
  white: '#FFFFFF',
};

export const theme = {
  fonts: {
    roboto: "'Roboto', sans-serif",
    baskerville: "'Libre Baskerville', serif",
  },
  buttons: {
    default: {
      color: colors.black,
      backgroundColor: 'transparent',
    },
    primary: {
      color: colors.white,
      backgroundColor: colors.primary,
    },
    outline: {
      color: colors.black,
      backgroundColor: 'transparent',
      boxShadow: 'inset 0 0 0 2px',
    },
  },
};
