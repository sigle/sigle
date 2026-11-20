import { defineConfig, loadEnv } from "vite-plus";

export default defineConfig(({ mode }) => ({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    // Expose .env.test (without a prefix filter) as process.env in the tests
    env: loadEnv(mode, import.meta.dirname, ""),
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["tests/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
}));
