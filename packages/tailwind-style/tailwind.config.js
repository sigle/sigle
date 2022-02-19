module.exports = {
  content: ['./src/**/*.html'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: false,
            maxWidth: false,
            blockquote: {
              quotes: 'none',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
