module.exports = {
  content: ['./src/**/*.html'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: false,
            maxWidth: false,
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
