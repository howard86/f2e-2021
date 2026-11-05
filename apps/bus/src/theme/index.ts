import { defineConfig } from '@chakra-ui/react';
import { createAppSystem } from '@f2e/ui/system';
import colors from './colors';
import Button from './components/button';

const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: 'primary',
    },
  },
  theme: {
    keyframes: {
      backgroundSlide: {
        from: { objectPosition: '0 50%' },
        to: { objectPosition: '100% 50%' },
      },
      busBounce: {
        '0%': { top: '8px' },
        '10%': { top: '0' },
      },
      busTravel: {
        '0%': { right: '150%' },
        '45%': { right: '32%' },
        '60%': { right: 'calc(32% - 2px)' },
        '65%': { right: '32%' },
        '100%': { right: '-100%' },
      },
      humanFade: {
        '0%': { opacity: 1 },
        '22.5%': { opacity: 1 },
        '32.5%': { opacity: 0 },
        '72.5%': { opacity: 0 },
        '82.5%': { opacity: 1 },
      },
      roadTravel: {
        '0%': { left: '100%', opacity: 0 },
        '20%': { opacity: 1 },
        '100%': { left: 0, opacity: 0 },
      },
    },
    recipes: {
      button: Button,
    },
    tokens: {
      colors,
      gradients: {
        background: {
          value:
            'linear-gradient(180deg, #200337 0%, rgba(51, 61, 113, 0.82) 49.48%, #443B68 100%)',
        },
      },
      shadows: {
        text: {
          value:
            '0 0 4px var(--chakra-colors-secondary-400),0 0 8px var(--chakra-colors-secondary-300)',
        },
      },
    },
  },
});

const theme = createAppSystem(config);

export default theme;
