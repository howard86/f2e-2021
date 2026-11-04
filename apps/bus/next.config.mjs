import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type{import('next').NextConfig} */
const config = {
  experimental: {
    optimizePackageImports: ['@chakra-ui/react', 'react-icons'],
  },
  outputFileTracingRoot: join(dirname(fileURLToPath(import.meta.url)), '../..'),
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
