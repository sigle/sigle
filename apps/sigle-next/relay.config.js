module.exports = {
  src: './src',
  language: 'typescript',
  schema: './ceramic/runtime-schema.graphql',
  artifactDirectory: './src/__generated__/relay',
  exclude: ['**/node_modules/**', '**/__mocks__/**', '**/__generated__/**'],
};
