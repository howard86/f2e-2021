import { defineGlobalStyles } from '@chakra-ui/react';

const styles = defineGlobalStyles({
  body: {
    bg: 'blackAlpha.800',
    fontFamily: 'body',
    h: 'full',
  },
  html: {
    h: 'full',
    scrollBehavior: 'smooth',
  },
});

export default styles;
