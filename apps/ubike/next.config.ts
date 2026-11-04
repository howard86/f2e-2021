import { join } from 'node:path';

import type { NextConfig } from 'next';

const config: NextConfig = {
  experimental: {
    optimizePackageImports: [
      '@chakra-ui/react',
      'react-icons',
      'framer-motion',
    ],
  },
  outputFileTracingRoot: join(import.meta.dirname, '../..'),
  reactStrictMode: true,
};

export default config;
