// TODO oxlint react plugin

const eslintConfig = defineConfig([
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/use-memo": "off",
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      // Handled by biome
      "react-hooks/exhaustive-deps": "off",
      // Handled by biome
      "@next/next/no-img-element": "off",
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
]);

export default eslintConfig;
