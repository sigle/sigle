import { defineConfig, loadEnv } from "vite-plus";

export default defineConfig(({ mode }) => ({
  pack: {
    entry: ["src/main.ts"],
    format: ["esm"],
    deps: {
      // The SDK is a workspace package that resolves its peers (zod, @stacks)
      // from its own devDependencies. Bundling it makes them resolve from this
      // app's dependencies in a production install.
      alwaysBundle: ["@sigle/sdk"],
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    // Expose .env.test (without a prefix filter) as process.env in the tests
    env: loadEnv(mode, import.meta.dirname, ""),
    environment: "node",
    include: ["src/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
}));
