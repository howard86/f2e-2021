import { Box, type BoxProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

import Footer from './footer';
import Header from './header';

interface LayoutProps extends BoxProps {
  children: ReactNode;
  gradientColor: string;
  mainColor: BoxProps['color'];
}

const Layout = ({
  children,
  mainColor,
  gradientColor,
  ...props
}: LayoutProps) => (
  <>
    <Header mainColor={mainColor} />
    <Box as="main" minH="100%" {...props}>
      {children}
    </Box>
    <Footer gradientColor={gradientColor} mainColor={mainColor} />
  </>
);

export default Layout;
