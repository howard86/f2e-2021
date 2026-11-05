import { defineRecipe } from '@chakra-ui/react';

const Button = defineRecipe({
  variants: {
    variant: {
      plain: {
        _hover: {
          bgColor: 'bg.subtle',
        },
        bgColor: 'bg.muted',
        borderRadius: 'full',
      },
      subtle: {
        _focusVisible: {
          bgColor: 'colorPalette.solid',
          color: 'colorPalette.contrast',
        },
        _hover: {
          bgColor: 'colorPalette.solid',
          color: 'colorPalette.contrast',
        },
        bgColor: 'bg.muted',
        flexShrink: 0,
      },
    },
  },
});

export default Button;
