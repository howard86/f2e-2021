import { defineConfig } from '@chakra-ui/react';
import { createAppSystem } from '@f2e/ui/system';

import colors from './colors';

export const config = defineConfig({
  globalCss: {
    body: {
      bg: 'blackAlpha.800',
    },
  },
  theme: {
    tokens: {
      colors,
    },
  },
});

export default createAppSystem(config);
