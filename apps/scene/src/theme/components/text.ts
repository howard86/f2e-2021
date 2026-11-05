import { defineTextStyles } from '@chakra-ui/react';

const Text = defineTextStyles({
  body: {
    value: {
      fontSize: '16px',
      lineHeight: 1.75,
    },
  },
  'body-sm': {
    value: {
      fontSize: '14px',
      lineHeight: 1.6,
    },
  },
  display: {
    value: {
      fontSize: '40px',
      fontWeight: 'bold',
      letterSpacing: '-0.01em',
      lineHeight: '48px',
    },
  },
  // Long-form reading text; Prose caps the measure at ~68ch.
  prose: {
    value: {
      fontSize: '17px',
      lineHeight: 1.8,
    },
  },
  'title-lg': {
    value: {
      fontSize: '32px',
      fontWeight: 'bold',
      lineHeight: 1.3,
    },
  },
  'title-md': {
    value: {
      fontSize: '24px',
      fontWeight: 'bold',
      lineHeight: 1.35,
    },
  },
  'title-sm': {
    value: {
      fontSize: '20px',
      fontWeight: 'bold',
      lineHeight: 1.4,
    },
  },
});

export default Text;
