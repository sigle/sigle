// @ts-check
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import mermaid from "astro-mermaid";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://docs.sigle.io",
  integrations: [
    mermaid({ autoTheme: true }),
    starlight({
      title: "Sigle",
      description:
        "Documentation for Sigle, an open-source writing platform for web3 content creators.",
      favicon: "/favicon.ico",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/sigle/sigle",
        },
        {
          icon: "discord",
          label: "Discord",
          href: "https://app.sigle.io/discord",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/sigle/sigle/edit/main/apps/docs/",
      },
      customCss: ["./src/styles/custom.css"],
      components: {
        Footer: "./src/components/Footer.astro",
      },
      sidebar: [
        { slug: "index", label: "Overview" },
        { slug: "monetization" },
        { slug: "platform" },
        {
          label: "Build on Sigle",
          items: [
            { slug: "build-on-sigle/intro" },
            { slug: "build-on-sigle/sdk" },
            { slug: "build-on-sigle/api" },
            { slug: "build-on-sigle/testnet" },
          ],
        },
        { slug: "architecture" },
        { slug: "links" },
      ],
    }),
    sitemap(),
  ],
  vite: {
    build: {
      chunkSizeWarningLimit: 700,
    },
  },
});
