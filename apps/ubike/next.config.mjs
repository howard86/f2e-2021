import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type{import('next').NextConfig} */
const config = {
  experimental: {
    optimizePackageImports: [
      '@chakra-ui/react',
      'react-icons',
      'framer-motion',
    ],
  },
  outputFileTracingRoot: join(dirname(fileURLToPath(import.meta.url)), '../..'),
  reactStrictMode: true,
};

export default config;
