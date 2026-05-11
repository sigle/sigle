import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts"],
    sourcemap: true,
    clean: true,
    dts: true,
    platform: "neutral",
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.test-d.ts"],
  },
});
