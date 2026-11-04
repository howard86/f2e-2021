import { join } from 'node:path';

import type { NextConfig } from 'next';

const config: NextConfig = {
  experimental: {
    optimizePackageImports: ['@chakra-ui/react', 'react-icons'],
  },
  outputFileTracingRoot: join(import.meta.dirname, '../..'),
  reactStrictMode: true,
  rewrites: async () => [
    {
      destination: '/api/bus-estimation',
      source: '/api/bus/estimation',
    },
    {
      destination: '/api/bus-nearby',
      source: '/api/bus/nearby',
    },
    {
      destination: '/api/bus-route',
      source: '/api/bus/route',
    },
  ],
};

export default config;
