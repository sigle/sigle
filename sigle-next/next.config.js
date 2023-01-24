/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: [
    // `.page.tsx` for page components
    'page.tsx',
    // `.api.ts` for API routes
    'api.ts',
  ],
  compiler: {
    relay: {
      src: './src',
      artifactDirectory: './__generated__',
      language: 'typescript',
    },
  },
};

module.exports = nextConfig;
