// @ts-check
import { defineConfig } from "@rspack/cli";

export default defineConfig({
  entry: {
    main: "./src/index.ts",
  },
  resolve: {
    extensions: [".ts"],
  },
  target: "es2020",
  output: {
    filename: "index.js",
    module: true,
    library: {
      type: "module",
    },
  },
  module: {
    rules: [
      {
        test: /\.clar$/,
        type: "asset/source",
      },
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: "builtin:swc-loader",
        options: {
          jsc: {
            parser: {
              syntax: "typescript",
            },
          },
        },
      },
    ],
  },
});
