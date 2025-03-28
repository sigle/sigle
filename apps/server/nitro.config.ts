export default defineNitroConfig({
  srcDir: "src",
  compatibilityDate: "2025-03-20",
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
