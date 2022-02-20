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

module.exports = {
  content: ['./src/**/*.html'],
  theme: {
    extend: {
      typography: {
        gray: {
          css: {
            '--tw-prose-body': gray.gray10,
            '--tw-prose-headings': gray.gray11,
            '--tw-prose-lead': gray.gray6,
            '--tw-prose-links': gray.gray11,
            '--tw-prose-bold': gray.gray11,
            '--tw-prose-counters': gray.gray9,
            '--tw-prose-bullets': gray.gray5,
            '--tw-prose-quotes': gray.gray10,
            '--tw-prose-quote-borders': gray.gray5,
            '--tw-prose-captions': gray.gray8,
            '--tw-prose-code': gray.gray11,
            '--tw-prose-pre-code': gray.gray5,
            '--tw-prose-pre-bg': gray.gray10,
          },
        },
        DEFAULT: {
          css: {
            maxWidth: false,
            blockquote: {
              quotes: false,
            },
            'code::before': false,
            'code::after': false,
            code: {
              fontWeight: '400',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
