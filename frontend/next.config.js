/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/landing.html',
      },
      {
        source: '/landing',
        destination: '/landing.html',
      },
    ];
  },
};

module.exports = nextConfig;
