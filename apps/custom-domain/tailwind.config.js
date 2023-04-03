/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sigle: {
          background: '#fcfcfc',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: false,
            h1: {
              color: false,
            },
            h2: {
              color: false,
            },
            h3: {
              color: false,
            },
            h4: {
              color: false,
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
