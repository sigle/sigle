import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  srcDir: "src",
  imports: false,
  openAPI: {
    production: "runtime",
  },
  experimental: {
    openAPI: true,
    tasks: true,
  },
});
