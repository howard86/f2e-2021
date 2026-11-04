import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

import colors from './colors';
import styles from './styles';

const config = defineConfig({
  globalCss: styles,
  theme: {
    tokens: {
      colors,
      fonts: {
        body: { value: 'var(--font-roboto), sans-serif' },
        heading: { value: 'var(--font-roboto), sans-serif' },
      },
    },
  },
});

export default createSystem(defaultConfig, config);
