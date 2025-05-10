// This file will be used to modify the Next.js config for a minimal deployment

module.exports = {
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/',
      },
      {
        source: '/todo',
        destination: '/todo',
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/((?!todo|api|_next/static|_next/image|favicon.ico).*)',
        destination: '/404',
        permanent: false,
      },
    ];
  }
}; 