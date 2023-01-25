module.exports = {
  src: './src',
  language: 'typescript',
  schema: './ceramic/runtime-schema.graphql',
  artifactDirectory: './src/graphql/__generated__',
  exclude: ['**/node_modules/**', '**/__mocks__/**', '**/__generated__/**'],
};
