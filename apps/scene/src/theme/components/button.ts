import { defineRecipe } from '@chakra-ui/react';

const Button = defineRecipe({
  variants: {
    variant: {
      plain: {
        _hover: {
          bgColor: 'blackAlpha.100',
        },
        bgColor: 'blackAlpha.200',
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
        bgColor: 'gray.100',
        flexShrink: 0,
      },
    },
  },
});

export default Button;
