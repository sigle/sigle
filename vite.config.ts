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
    settings: {
      // Tailwind v4 reads the theme from the web app's stylesheet.
      "better-tailwindcss": {
        cwd: "./apps/sigle",
        entryPoint: "./src/app/globals.css",
      },
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
        files: ["apps/sigle/**"],
        plugins: ["nextjs"],
        jsPlugins: ["eslint-plugin-better-tailwindcss"],
        rules: {
          // Every rule of Oxlint's nextjs plugin, which the preset doesn't enable.
          "nextjs/google-font-display": "error",
          "nextjs/google-font-preconnect": "error",
          "nextjs/inline-script-id": "error",
          "nextjs/next-script-for-ga": "error",
          "nextjs/no-assign-module-variable": "error",
          "nextjs/no-async-client-component": "error",
          "nextjs/no-before-interactive-script-outside-document": "error",
          "nextjs/no-css-tags": "error",
          "nextjs/no-document-import-in-page": "error",
          "nextjs/no-duplicate-head": "error",
          "nextjs/no-head-element": "error",
          "nextjs/no-head-import-in-document": "error",
          "nextjs/no-html-link-for-pages": "error",
          "nextjs/no-img-element": "error",
          "nextjs/no-page-custom-font": "error",
          "nextjs/no-script-component-in-head": "error",
          "nextjs/no-styled-jsx-in-document": "error",
          "nextjs/no-sync-scripts": "error",
          "nextjs/no-title-in-document-head": "error",
          "nextjs/no-typos": "error",
          "nextjs/no-unwanted-polyfillio": "error",
          // Class order is sorted by oxfmt's `sortTailwindcss`.
          "better-tailwindcss/enforce-canonical-classes": "error",
          "better-tailwindcss/no-conflicting-classes": "error",
          "better-tailwindcss/no-deprecated-classes": "error",
          "better-tailwindcss/no-duplicate-classes": "error",
          "better-tailwindcss/no-unknown-classes": "error",
          "better-tailwindcss/no-unnecessary-whitespace": "error",
          "no-restricted-imports": [
            "error",
            {
              paths: [
                {
                  name: "next/link",
                  message: "Use components/Shared/NextLink instead",
                },
              ],
            },
          ],
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
