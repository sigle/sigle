import { defineConfig } from "nitro-test-utils/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(
  {
    plugins: [tsconfigPaths()],
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
      // setupFiles: ["./src/test/setup-e2e.ts"],
    },
  },
  {
    global: true,
  },
);
