import { join } from 'node:path';

import type { NextConfig } from 'next';

const config: NextConfig = {
  experimental: {
    cpus: 1,
    optimizePackageImports: ['@chakra-ui/react', 'react-icons'],
    // Prerender one page at a time, as the Pages Router build did: parallel
    // pages burst past TDX's rate limit and fail the build.
    staticGenerationMaxConcurrency: 1,
  },
  outputFileTracingRoot: join(import.meta.dirname, '../..'),
  reactStrictMode: true,
};

export default config;
