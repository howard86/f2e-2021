import { defineRecipe } from '@chakra-ui/react';

// Chakra's Link colours text with `colorPalette.fg`, which is now the category
// accent. Ordinary links keep the surrounding text colour; accent links opt in
// with `color="colorPalette.fg"`.
const Link = defineRecipe({
  variants: {
    variant: {
      plain: { color: 'inherit' },
      underline: { color: 'inherit' },
    },
  },
});

export default Link;
