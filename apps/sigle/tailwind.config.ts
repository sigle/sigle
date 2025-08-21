import type { Config } from "tailwindcss";

const config = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "var(--gray-12)",
            "--tw-prose-hr": "var(--gray-5)",
            "--tw-prose-invert-hr": "var(--gray-5)",
            maxWidth: false,
            // Center images in prose
            img: {
              marginLeft: "auto",
              marginRight: "auto",
            },
          },
        },
      },
    },
  },
} satisfies Config;

export default config;
