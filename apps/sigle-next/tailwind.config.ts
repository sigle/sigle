import type { Config } from "tailwindcss";
import { radixThemePreset } from "radix-themes-tw";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#ffffff",
      },
      borderRadius: {
        none: "0px",
      },
      typography: {
        DEFAULT: {
          css: {
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
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
  presets: [radixThemePreset],
};

export default config;
