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
            '--tw-prose-links': orange.orange11,
            '--tw-prose-bold': gray.gray10,
            '--tw-prose-counters': gray.gray10,
            '--tw-prose-bullets': gray.gray10,
            '--tw-prose-quotes': gray.gray10,
            '--tw-prose-quote-borders': gray.gray6,
            '--tw-prose-captions': gray.gray9,
            '--tw-prose-code': gray.gray11,
            '--tw-prose-pre-code': gray.gray5,
            '--tw-prose-pre-bg': gray.gray11,
            '--tw-prose-hr': gray.gray6,
          },
        },
        DEFAULT: {
          css: {
            maxWidth: '760px',
            fontSize: '16px',
            blockquote: {
              quotes: false,
              borderLeftWidth: '2px',
            },
            'blockquote p:first-of-type::before': false,
            'blockquote p:last-of-type::after': false,
            'code::before': false,
            'code::after': false,
            code: {
              fontWeight: '400',
              fontSize: '14px',
              backgroundColor: gray.gray4,
              padding: '1px 4px',
              borderRadius: '4px',
            },
            p: {
              lineHeight: '26px',
              letterSpacing: '0.2px',
            },
            h1: {
              fontWeight: '700',
              fontSize: '32px',
              lineHeight: '40px',
              letterSpacing: '-0.3px',
            },
            h2: {
              fontWeight: '600',
              fontSize: '24px',
              lineHeight: '28px',
              letterSpacing: '-0.3px',
            },
            'h2 strong': {
              color: 'var(--tw-prose-headings)',
              fontWeight: '700',
            },
            h3: {
              fontWeight: '600',
              fontSize: '20px',
              lineHeight: '24px',
            },
            'h3 strong': {
              color: 'var(--tw-prose-headings)',
              fontWeight: '700',
            },
            // We only use h1, h2, h3
            h4: false,
            a: {
              textDecoration: 'none',
            },
            'a strong': {
              color: 'var(--tw-prose-links)',
            },
            img: {
              marginTop: false,
              marginBottom: false,
              margin: '2em auto',
            },
            '[class~="lead"]': false,
          },
        },
        lg: {
          css: {
            fontSize: '18px',
            h1: {
              fontSize: '36px',
              lineHeight: '42px',
            },
            h2: {
              fontSize: '30px',
              lineHeight: '40px',
            },
            h3: {
              fontSize: '22px',
              lineHeight: '28px',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
