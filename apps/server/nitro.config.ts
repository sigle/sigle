import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  srcDir: "src",
  imports: false,
  compatibilityDate: "latest",
  esbuild: {
    options: {
      target: "es2023",
    },
  },
  openAPI: {
    production: "runtime",
  },
  experimental: {
    openAPI: true,
    tasks: true,
  },
});
