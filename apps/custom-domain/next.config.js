/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,

    // SWC is wrongly included in the final bundle causing function to be > 50mb
    // https://github.com/vercel/next.js/issues/42641#issuecomment-1615901228
    outputFileTracingExcludes: {
      '*': [
        './**/@swc/core-linux-x64-gnu*',
        './**/@swc/core-linux-x64-musl*',
        './**/@esbuild/linux-x64*',
      ],
    },
  },
  env: {
    API_URL: process.env.API_URL,
  },
  // TODO find another way to do this
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
