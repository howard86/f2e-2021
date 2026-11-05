import { Box } from '@chakra-ui/react';
import { NextImage as Image } from '@f2e/ui/next-image';
import type { ReactNode } from 'react';
import background from '@/background.png';
import MapView from './map';

interface LayoutProps {
  children: ReactNode;
  hideLocate?: boolean;
  showMap?: boolean;
}

export const MOBILE_MAP_BOTTOM = '200px';
export const DESKTOP_MAP_LEFT = '400px';

const Layout = ({ children, showMap, hideLocate }: LayoutProps) => (
  <Box bgGradient="background" h="full">
    <Box h="full" overflow="hidden" pos="fixed" w="full">
      <Box
        _motionReduce={{ animation: 'none' }}
        animation="backgroundSlide 60s linear infinite alternate"
        h="full"
        left="0"
        pos="absolute"
        top="0"
        w="120%"
        willChange="transform"
      >
        <Image
          alt="background"
          layout="fill"
          objectFit="cover"
          placeholder="blur"
          src={background}
        />
      </Box>
    </Box>
    <Box
      bottom={[MOBILE_MAP_BOTTOM, 0]}
      left={[0, DESKTOP_MAP_LEFT]}
      opacity={showMap ? 1 : 0}
      pos="absolute"
      right="0"
      top={['72px', 66]}
    >
      <MapView hideLocate={hideLocate} />
    </Box>
    {children}
  </Box>
);

export default Layout;
