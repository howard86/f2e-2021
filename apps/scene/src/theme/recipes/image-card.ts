import { defineSlotRecipe } from '@chakra-ui/react';

// Shared look for image cards with a hover/focus overlay, registered as
// `imageCard` in theme/index.ts.
const imageCard = defineSlotRecipe({
  base: {
    image: {
      height: 'full',
      objectFit: 'cover',
      width: 'full',
    },
    meta: {
      alignItems: 'center',
      display: 'flex',
    },
    overlay: {
      _focusWithin: { bg: 'blackAlpha.600' },
      _hover: { bg: 'blackAlpha.600' },
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      inset: '0',
      position: 'absolute',
      transitionDuration: '0.2s',
      transitionProperty: 'background-color',
      transitionTimingFunction: 'ease-out',
      zIndex: 'docked',
    },
    root: {
      _focusWithin: {
        outlineColor: 'colorPalette.focusRing',
        outlineOffset: '2px',
        outlineStyle: 'solid',
        outlineWidth: '2px',
      },
      overflow: 'hidden',
      position: 'relative',
    },
    title: {
      fontWeight: 'bold',
    },
  },
  className: 'image-card',
  defaultVariants: {
    rounded: '2xl',
  },
  slots: ['root', 'image', 'overlay', 'title', 'meta'],
  variants: {
    rounded: {
      '2xl': { root: { rounded: '2xl' } },
      '3xl': { root: { rounded: '3xl' } },
      xl: { root: { rounded: 'xl' } },
    },
  },
});

export default imageCard;
