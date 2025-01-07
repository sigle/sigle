export default defineNitroConfig({
  srcDir: 'src',
  compatibilityDate: '2024-11-02',
  experimental: {
    openAPI: true,
    tasks: true,
  },
  openAPI: {
    production: 'prerender',
  },
});
