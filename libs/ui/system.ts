import {
  createSystem,
  defaultConfig,
  defineConfig,
  type SystemConfig,
} from '@chakra-ui/react';

/**
 * Settings every app shares. Each app's root layout loads its font through
 * next/font with `variable: '--font-body'`.
 */
const baseConfig = defineConfig({
  globalCss: {
    body: {
      fontFamily: 'body',
      h: 'full',
    },
    html: {
      h: 'full',
      scrollBehavior: 'smooth',
    },
  },
  theme: {
    tokens: {
      fonts: {
        body: { value: 'var(--font-body), sans-serif' },
        heading: { value: 'var(--font-body), sans-serif' },
      },
    },
  },
});

/** Chakra's defaults, then the shared base, then the app's own config. */
export const createAppSystem = (config: SystemConfig) =>
  createSystem(defaultConfig, baseConfig, config);
