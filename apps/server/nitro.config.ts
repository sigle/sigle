export default defineNitroConfig({
  srcDir: "src",
  compatibilityDate: "2024-11-02",
  esbuild: {
    options: {
      target: "es2022",
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
