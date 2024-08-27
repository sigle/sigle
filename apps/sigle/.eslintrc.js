module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
    'plugin:tailwindcss/recommended',
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': 2,
    '@typescript-eslint/no-use-before-define': 'off',
    'react/display-name': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/no-unescaped-entities': ['error', { forbid: ['>', '}'] }],
    'import/order': [
      'error',
      {
        'newlines-between': 'never',
        pathGroups: [
          {
            pattern: '@/**',
            group: 'external',
            position: 'after',
          },
        ],
        groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
      },
    ],
  },
};
