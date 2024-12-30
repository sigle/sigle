// @ts-check
import { defineConfig } from '@rspack/cli';

export default defineConfig({
  entry: {
    main: './src/index.ts',
  },
  resolve: {
    extensions: ['.ts'],
  },
  target: 'es2020',
  experiments: {
    outputModule: true,
  },
  output: {
    filename: 'index.js',
    library: {
      type: 'module',
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
            },
          },
        },
      },
    ],
  },
});
