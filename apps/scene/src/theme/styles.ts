import { defineGlobalStyles } from '@chakra-ui/react';

const styles = defineGlobalStyles({
  body: {
    color: 'text.body',
    fontFamily: 'body',
    h: 'full',
  },
  'h1, h2, h3, h4, h5': {
    color: 'text.head',
  },
  html: {
    h: 'full',
    scrollBehavior: 'smooth',
  },
});

export default styles;
