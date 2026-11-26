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
        // Rules of @cloudflare/oxlint-config that the code doesn't pass yet,
        // off until each is fixed or kept off with a reason. Last, so the
        // preset's file overrides don't turn them back on.
        files: ["**"],
        rules: {
          "@nkzw/no-instanceof": "off",
          "@nkzw/require-use-effect-arguments": "off",
          "no-console": "off",
          "no-useless-assignment": "off",
          "prefer-promise-reject-errors": "off",
          "jsx-a11y/alt-text": "off",
          "react/immutability": "off",
          "react/no-unknown-property": "off",
          "react/purity": "off",
          "react/set-state-in-effect": "off",
          "react/use-memo": "off",
          "typescript/no-floating-promises": "off",
          "typescript/no-misused-promises": "off",
          "typescript/no-unsafe-argument": "off",
          "typescript/no-unsafe-assignment": "off",
          "typescript/no-unsafe-call": "off",
          "typescript/no-unsafe-member-access": "off",
          "typescript/no-unsafe-return": "off",
          "typescript/no-unsafe-type-assertion": "off",
          "typescript/only-throw-error": "off",
          "typescript/require-array-sort-compare": "off",
          "typescript/switch-exhaustiveness-check": "off",
          "typescript/use-unknown-in-catch-callback-variable": "off",
          "unicorn/catch-error-name": "off",
          "unicorn/consistent-function-scoping": "off",
          "unicorn/no-invalid-fetch-options": "off",
          "unicorn/prefer-at": "off",
          "unicorn/prefer-dom-node-append": "off",
          "unicorn/text-encoding-identifier-case": "off",
        },
      },
    ],
  },
});
