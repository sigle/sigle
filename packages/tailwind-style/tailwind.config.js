// TODO remove " in blockquotes
// TODO remove H1 from editor options
// TODO rename H2 - H3 big + small
// TODO add titles icons to bubble menu @quentin?

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
            // What is this?
            '--tw-prose-lead': gray.gray6,
            // TODO orange 11
            '--tw-prose-links': gray.gray11,
            '--tw-prose-bold': gray.gray10,
            // TODO color of the rest of the items
            '--tw-prose-counters': gray.gray9,
            '--tw-prose-bullets': gray.gray5,
            '--tw-prose-quotes': gray.gray10,
            '--tw-prose-quote-borders': gray.gray6,
            '--tw-prose-captions': gray.gray8,
            '--tw-prose-code': gray.gray11,
            '--tw-prose-pre-code': gray.gray5,
            '--tw-prose-pre-bg': gray.gray10,
            '--tw-prose-hr': gray.gray6,
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
            // TODO make tests with 600 / 700 by defaults for title
            h2: {
              fontWeight: '600',
              fontSize: '30px',
            },
            'h2 strong': {
              color: 'var(--tw-prose-headings)',
              fontWeight: '700',
            },
            h3: {
              fontWeight: '600',
            },
            'h3 strong': {
              color: 'var(--tw-prose-headings)',
              fontWeight: '700',
            },
            // We only use h1, h2, h3
            h4: false,
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
