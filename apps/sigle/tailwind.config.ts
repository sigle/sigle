import type { Config } from "tailwindcss";

const config = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "var(--primary)",
            "--tw-prose-hr": "var(--muted)",
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
