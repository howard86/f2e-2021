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
  // Old query-string list URLs. Next passes the request query through, so the
  // old params stay on the new URL (ignored; the new paths never match the
  // sources again, so there is no loop).
  redirects: async () => [
    ...['scenes', 'restaurants', 'hotels'].map((list) => ({
      destination: `/${list}/:city`,
      has: [
        { key: 'city', type: 'query' as const, value: '(?<city>[A-Za-z]+)' },
      ],
      permanent: false,
      source: `/${list}`,
    })),
    {
      destination: '/events/:when/:city',
      has: [
        {
          key: 'when',
          type: 'query' as const,
          value: '(?<when>ongoing|upcoming)',
        },
        { key: 'city', type: 'query' as const, value: '(?<city>[A-Za-z]+)' },
      ],
      permanent: false,
      source: '/events',
    },
    {
      destination: '/events/ongoing/:city',
      has: [
        { key: 'city', type: 'query' as const, value: '(?<city>[A-Za-z]+)' },
      ],
      permanent: false,
      source: '/events',
    },
  ],
  // A prerendered city page waits for its paced TDX requests, often past the
  // 60 s default; a timed-out attempt keeps spending quota while Next retries
  // it, so give each page room to finish once.
  staticPageGenerationTimeout: 600,
  transpilePackages: ['@f2e/tdx-core', '@f2e/tdx-tourism', '@f2e/ui'],
};

export default config;
