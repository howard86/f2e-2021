import { existsSync } from 'node:fs';
import { join } from 'node:path';

import type { NextConfig } from 'next';

// Shared TDX credentials live in the repo-root .env.local. Next only loads
// env files from the app directory, and @next/env's loadEnvConfig is cached
// after that first load, so read the root file directly. Variables already
// set (shell, Vercel, app-level .env files) win.
const rootEnvFile = join(import.meta.dirname, '../../.env.local');
if (existsSync(rootEnvFile)) {
  process.loadEnvFile(rootEnvFile);
}

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
  transpilePackages: ['@f2e/tdx-core', '@f2e/tdx-bike'],
};

export default config;
