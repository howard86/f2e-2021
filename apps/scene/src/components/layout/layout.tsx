import { Box, type BoxProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import type { Category } from '@/constants/categories';

import Footer from './footer';
import Header from './header';

interface LayoutProps extends BoxProps {
  children: ReactNode;
  colorPalette: Category;
}

const Layout = ({ children, colorPalette, ...props }: LayoutProps) => (
  <Box colorPalette={colorPalette} id="top" minH="100vh">
    <Header />
    <Box as="main" id="main-content" minH="60vh" {...props}>
      {children}
    </Box>
    <Footer />
  </Box>
);

export default Layout;
