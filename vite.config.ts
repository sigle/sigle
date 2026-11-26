import cloudflare from "@cloudflare/oxlint-config/vite-plus";
import { recommended } from "@effect/tsgo/oxlint-presets";
import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  run: {
    cache: true,
  },
  fmt: {
    ignorePatterns: ["repos/**", "**/drizzle/**", ".agents/**"],
    printWidth: 80,
    experimentalSortImports: {
      newlinesBetween: false,
      groups: [
        "type-import",
        ["value-builtin", "value-external"],
        "type-internal",
        "value-internal",
        ["type-parent", "type-sibling", "type-index"],
        ["value-parent", "value-sibling", "value-index"],
        "unknown",
      ],
    },
    overrides: [
      {
        files: ["apps/sigle/**"],
        options: {
          sortTailwindcss: {
            functions: ["cn", "cva"],
            stylesheet: "apps/sigle/src/app/globals.css",
          },
        },
      },
    ],
  },
  lint: {
    extends: [cloudflare],
    // Oxlint reads `env` and `ignorePatterns` from the root lint config only.
    env: cloudflare.env,
    ignorePatterns: [
      ...cloudflare.ignorePatterns,
      "__generated__",
      "repos/**",
      ".agents/**",
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      // Namespace imports are the documented form for zod (`* as z`), the
      // Drizzle schema passed whole to `drizzle()` and Better Auth, and the
      // `* as React` the shadcn CLI generates in components/ui.
      "import/no-namespace": "off",
      // React ignores what event handlers return, so async handlers passed to
      // JSX attributes such as `onClick` are allowed.
      "typescript/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      // `next/og` renders Open Graph images with Satori, which reads `tw`.
      "react/no-unknown-property": ["error", { ignore: ["tw"] }],
    },
    overrides: [
      {
        files: ["apps/server/**"],
        plugins: ["effecttsgo"],
        rules: {
          ...recommended.rules,
          // Flags Layer.provide chains in tests, where readability wins.
          "effecttsgo/multiple-effect-provide": "off",
        },
      },
      {
        // Test helpers stay next to the one test that uses them.
        files: ["**/*.test.ts", "**/*.test.tsx"],
        rules: {
          "unicorn/consistent-function-scoping": "off",
        },
      },
    ],
  },
});
