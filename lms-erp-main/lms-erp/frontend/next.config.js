/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  trailingSlash: true,
  assetPrefix: process.env.NODE_ENV === 'production' ? '.' : undefined,
};
module.exports = nextConfig;
