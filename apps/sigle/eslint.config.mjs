import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:tailwindcss/recommended",
  ),
  {
    settings: {
      "better-tailwindcss": {
        tailwindConfig: "tailwind.config.ts",
      },
    },
    plugins: {
      "better-tailwindcss": eslintPluginBetterTailwindcss,
    },
    rules: {
      ...eslintPluginBetterTailwindcss.configs["recommended-warn"].rules,
      ...eslintPluginBetterTailwindcss.configs["recommended-error"].rules,
      // Need to disable for Tailwind v3, can be enabled again when migrating to Tailwind v4
      "better-tailwindcss/no-conflicting-classes": "off",
      "better-tailwindcss/multiline": "off",

      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
      "jsx-a11y/alt-text": "off",
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
];

export default eslintConfig;
