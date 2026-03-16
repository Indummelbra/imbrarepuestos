/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'movil.indummelbra.com',
        port: '50101',
        pathname: '/Imbrapp/images/**',
      },
    ],
  },
};

module.exports = nextConfig;
