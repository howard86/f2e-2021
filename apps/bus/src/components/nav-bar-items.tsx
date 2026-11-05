import { HStack, type StackProps } from '@chakra-ui/react';
import { RouteLink } from '@f2e/ui/links';
import { usePathname } from 'next/navigation';
import LogoIcon from './icons/logo';

interface NavBarItemsProps {
  display?: StackProps['display'];
}

const NavBarItems = ({ display }: NavBarItemsProps) => {
  const pathname = usePathname();

  return (
    <>
      <RouteLink href="/">
        <LogoIcon display={display} maxH="34px" />
      </RouteLink>
      <HStack display={display} fontSize="xl">
        <RouteLink
          href="/city"
          mr={6}
          textShadow={pathname === '/city' ? 'text' : undefined}
        >
          公車定位
        </RouteLink>
        <RouteLink
          href="/nearby"
          textShadow={pathname === '/nearby' ? 'text' : undefined}
        >
          附近站牌
        </RouteLink>
      </HStack>
    </>
  );
};

export default NavBarItems;
