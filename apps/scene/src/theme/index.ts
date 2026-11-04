import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import colors from './colors';
import Button from './components/button';
import Text from './components/text';
import imageCard from './recipes/image-card';
import styles from './styles';

const config = defineConfig({
  globalCss: styles,
  theme: {
    recipes: {
      button: Button,
    },
    slotRecipes: {
      imageCard,
    },
    textStyles: Text,
    tokens: {
      colors,
      fonts: {
        body: { value: 'var(--font-noto-sans-tc), sans-serif' },
      },
    },
  },
});

export default createSystem(defaultConfig, config);
