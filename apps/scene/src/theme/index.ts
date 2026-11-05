import { defineConfig } from '@chakra-ui/react';
import { createAppSystem } from '@f2e/ui/system';
import colors from './colors';
import Button from './components/button';
import Link from './components/link';
import Text from './components/text';

export const config = defineConfig({
  globalCss: {
    body: {
      bg: 'bg',
      color: 'fg',
    },
    'h1, h2, h3, h4, h5': {
      color: 'fg',
    },
    html: {
      colorPalette: 'scenes',
    },
  },
  theme: {
    recipes: {
      button: Button,
      link: Link,
    },
    semanticTokens: {
      colors,
    },
    textStyles: Text,
  },
});

export default createAppSystem(config);
