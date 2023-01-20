import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:5005/graphql',
  documents: ['src/**/*.tsx', '!src/gql/**/*'],
  generates: {
    './src/gql/': {
      preset: 'client',
      plugins: [],
    },
  },
};

export default config;
