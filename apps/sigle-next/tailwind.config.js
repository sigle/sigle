const gray = {
  gray1: '#fcfcfc',
  gray2: '#f6f6f6',
  gray3: '#f3f3f3',
  gray4: '#ededed',
  gray5: '#e8e8e8',
  gray6: '#e2e2e2',
  gray7: '#dbdbdb',
  gray8: '#c7c7c7',
  gray9: '#737373',
  gray10: '#2f2f2f',
  gray11: '#1a1a1a',
  gray12: '#080808',
};

const orange = {
  orange1: '#FFF9F6',
  orange2: '#FFF1EC',
  orange3: '#FFE9E1',
  orange4: '#FFE0D5',
  orange5: '#FFD6C7',
  orange6: '#FFC8B4',
  orange7: '#FFB79D',
  orange8: '#FF9873',
  orange9: '#F9703E',
  orange10: '#E9531D',
  orange11: '#DA3A00',
  orange12: '#CC3600',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      colors: { ...gray, ...orange },
      keyframes: {
        hide: {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        slideIn: {
          from: {
            transform: 'translateX(calc(100% + var(--viewport-padding)))',
          },
          to: { transform: 'translateX(0))' },
        },
        swipeOut: {
          from: { transform: 'translateX(var(--radix-toast-swipe-end-x))' },
          to: { transform: 'translateX(calc(100% + var(--viewport-padding)))' },
        },
      },
      animation: {
        hide: 'hide 100ms ease-in',
        slideIn: 'slideIn 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        swipeOut: 'swipeOut 100ms ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
