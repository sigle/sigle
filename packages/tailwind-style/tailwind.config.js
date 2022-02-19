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
              quotes: false,
            },
            'code::before': false,
            'code::after': false,
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
