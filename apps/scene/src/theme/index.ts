import { defineConfig } from '@chakra-ui/react';
import { createAppSystem } from '@f2e/ui/system';
import colors from './colors';
import Button from './components/button';
import Text from './components/text';
import imageCard from './recipes/image-card';

const config = defineConfig({
  globalCss: {
    body: {
      color: 'fg.muted',
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
    },
    semanticTokens: {
      colors,
    },
    slotRecipes: {
      imageCard,
    },
    textStyles: Text,
  },
});

export default createAppSystem(config);
