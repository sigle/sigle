import type { Config } from "tailwindcss";

const config = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "var(--primary)",
            "--tw-prose-hr": "var(--muted)",
            // Code blocks are a light panel in both themes, like the rest of
            // the site, instead of the plugin's dark box.
            "--tw-prose-pre-bg": "var(--muted)",
            "--tw-prose-pre-code": "var(--foreground)",
            "--tw-prose-invert-pre-bg": "var(--muted)",
            "--tw-prose-invert-pre-code": "var(--foreground)",
            pre: {
              border: "1px solid var(--border)",
            },
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
