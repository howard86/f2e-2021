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
