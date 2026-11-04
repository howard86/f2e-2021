import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type{import('next').NextConfig} */
const config = {
  experimental: {
    cpus: 1,
    optimizePackageImports: ['@chakra-ui/react', 'react-icons'],
    // Prerender one page at a time, as the Pages Router build did: parallel
    // pages burst past TDX's rate limit and fail the build.
    staticGenerationMaxConcurrency: 1,
  },
  outputFileTracingRoot: join(dirname(fileURLToPath(import.meta.url)), '../..'),
  reactStrictMode: true,
};

export default config;
