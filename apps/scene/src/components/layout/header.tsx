import { Flex, type FlexProps, HStack, Link, Text } from '@chakra-ui/react';
import { RouteLink } from '@f2e/ui/links';
import { Suspense } from 'react';
import ROUTES from '@/constants/routes';

import LogoMark from '../icons/logo-mark';
import GlobalSearch from '../search/global-search';
import CityScope from './city-scope';
import MenuDrawer from './menu-drawer';
import NavLink from './nav-link';
import PreferencesMenu from './preferences-menu';

const Header = (props: FlexProps) => (
  <Flex
    alignItems="center"
    as="header"
    backdropFilter="blur(12px) saturate(1.6)"
    bg="bg/85"
    borderBottomWidth="1px"
    gap="2"
    h="14"
    position="sticky"
    px={{ base: 3, md: 6 }}
    top="0"
    zIndex="sticky"
    {...props}
  >
    <Link
      _focusVisible={{ left: '3', top: '3' }}
      bg="bg"
      href="#main-content"
      left="-9999px"
      position="absolute"
      px="3"
      py="2"
      rounded="md"
      zIndex="skipLink"
    >
      跳到主要內容
    </Link>
    <MenuDrawer />
    <RouteLink aria-label="台灣旅遊導覽網首頁" gap="2" href="/" mr={{ lg: 4 }}>
      <LogoMark h="8" />
      <Text
        color="fg"
        display={{ base: 'none', sm: 'block' }}
        fontWeight="bold"
        letterSpacing="0.02em"
      >
        台灣旅遊導覽網
      </Text>
    </RouteLink>
    <HStack
      aria-label="主要導覽"
      as="nav"
      display={{ base: 'none', lg: 'flex' }}
      flexGrow={1}
      gap="1"
    >
      {ROUTES.map((route) => (
        <NavLink href={route.href} key={route.href}>
          {route.label}
        </NavLink>
      ))}
    </HStack>
    <Flex flexGrow={{ base: 1, lg: 0 }} />
    <GlobalSearch />
    <PreferencesMenu />
    {/* Reads the query string, so it needs its own boundary on static pages. */}
    <Suspense fallback={null}>
      <CityScope />
    </Suspense>
  </Flex>
);

export default Header;
