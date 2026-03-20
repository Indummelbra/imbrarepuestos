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
  async redirects() {
    return [
      {
        source: '/politicas/:slug',
        destination: '/legal/:slug',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
