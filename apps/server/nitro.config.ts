import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  serverDir: "src",
  imports: false,
  openAPI: {
    production: "runtime",
  },
  experimental: {
    openAPI: true,
    tasks: true,
  },
  typescript: {
    generateRuntimeConfigTypes: true,
    generateTsConfig: true,
  },
});
