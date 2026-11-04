import { defineGlobalStyles } from '@chakra-ui/react';

const styles = defineGlobalStyles({
  body: {
    color: 'fg.muted',
    fontFamily: 'body',
    h: 'full',
  },
  'h1, h2, h3, h4, h5': {
    color: 'fg',
  },
  html: {
    colorPalette: 'scenes',
    h: 'full',
    scrollBehavior: 'smooth',
  },
});

export default styles;
