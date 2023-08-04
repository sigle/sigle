/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        md: '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1140px',
      },
    },
    extend: {
      colors: {
        sigle: {
          background: '#fcfcfc',
          text: '#2f2f2f',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: false,
            color: false,
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
            // Center images in prose
            img: {
              marginLeft: 'auto',
              marginRight: 'auto',
            },
            // Center captions in figures
            figcaption: {
              textAlign: 'center',
              strong: {
                color: 'inherit',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
};
