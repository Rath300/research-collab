// This file will be used to modify the Next.js config for a minimal deployment

module.exports = {
  output: 'standalone',
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  webpack: (config, { isServer }) => {
    // Add a rule to handle .node files for Supabase
    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader',
      options: {
        name: '[name].[ext]',
      },
    });

    // Ignore optional native dependencies of ws
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }
    return config;
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