import { Box, type BoxProps } from '@chakra-ui/react';

// The inline <Logo /> is a ~1,700-line SVG; this paints the static copy
// through a CSS mask instead, so it can be used from client components
// without shipping the paths, and takes its colour from `bg`.
const LogoMark = (props: BoxProps) => (
  <Box
    aria-hidden
    aspectRatio={236 / 181}
    bg="colorPalette.solid"
    css={{
      maskImage: 'url(/static/logo.svg)',
      maskPosition: 'center',
      maskRepeat: 'no-repeat',
      maskSize: 'contain',
    }}
    flexShrink={0}
    h="8"
    {...props}
  />
);

export default LogoMark;
