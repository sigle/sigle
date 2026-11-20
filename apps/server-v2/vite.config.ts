import { defineConfig } from "vite-plus";

export default defineConfig({
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
    environment: "node",
    include: ["src/**/*.test.ts"],
    globalSetup: ["src/test/global-setup.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
