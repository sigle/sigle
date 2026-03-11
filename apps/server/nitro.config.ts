import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  srcDir: "src",
  imports: false,
  compatibilityDate: "latest",
  openAPI: {
    production: "runtime",
  },
  experimental: {
    openAPI: true,
    tasks: true,
  },
  routeRules: {
    "/api/users/trending": {
      swr: 60 * 5,
    },
  },
});
