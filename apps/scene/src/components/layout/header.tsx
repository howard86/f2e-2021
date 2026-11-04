'use client';

import {
  Avatar,
  Box,
  Flex,
  type FlexProps,
  HStack,
  IconButton,
  Separator,
} from '@chakra-ui/react';
import throttle from 'lodash.throttle';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import ROUTES from '@/constants/routes';
import getAvatar from '@/services/avatar';
import Logo from '../icons/logo';
import RouteLink from '../route-link';
import MenuPopover from './menu-popover';

const THROTTLED_TIME_MS = 500;

const initialState = { isScrollingUp: false, onTop: true };

interface HeaderProps extends FlexProps {
  mainColor: FlexProps['color'];
}

const Header = ({ mainColor, ...props }: HeaderProps) => {
  const router = useRouter();
  const scrollRef = useRef(0);
  const [state, setState] = useState(initialState);

  const isSolid = !state.onTop && state.isScrollingUp;

  const handleOnSearch = () => {
    router.push('/scenes');
  };

  useEffect(() => {
    const handleOnScroll = throttle(
      () => {
        setState({
          isScrollingUp: scrollRef.current > window.scrollY,
          onTop: window.scrollY < 10,
        });

        scrollRef.current = window.scrollY;
      },
      THROTTLED_TIME_MS,
      { leading: true },
    );

    window.addEventListener('scroll', handleOnScroll);
    return () => {
      window.removeEventListener('scroll', handleOnScroll);
    };
  }, []);

  return (
    <Flex
      alignItems="center"
      as="header"
      bg={isSolid ? mainColor : 'transparent'}
      borderBottomColor="purple.600"
      color={isSolid ? 'white' : 'text.body'}
      left="0"
      pos="fixed"
      px={[2, 4, 8]}
      py="2"
      right="0"
      shadow={isSolid ? 'xl' : 'none'}
      top={state.onTop || state.isScrollingUp ? 0 : '-200px'}
      transitionDuration="0.5s"
      transitionProperty="top, translateY"
      transitionTimingFunction="ease-out"
      translateY="50%"
      zIndex="banner"
      {...props}
    >
      <MenuPopover buttonBgColor={isSolid ? 'whiteAlpha.300' : 'transparent'} />
      <RouteLink display={['none', 'block']} href="/">
        <Logo height={12} width={12} />
      </RouteLink>

      <Box flexGrow={1} />
      <HStack
        display={['none', 'flex']}
        fontWeight="bold"
        gap={[2, 2, 4]}
        h="4"
        separator={
          <Separator
            borderColor={isSolid ? 'white' : 'text.body'}
            orientation="vertical"
          />
        }
      >
        {ROUTES.map((route) => (
          <RouteLink href={route.href} key={route.label}>
            {route.label}
          </RouteLink>
        ))}
        <IconButton
          _hover={{
            bgColor: isSolid ? mainColor : 'white',
          }}
          aria-label="search scene"
          fontSize={['xl', '2xl']}
          onClick={handleOnSearch}
          rounded="full"
          variant="ghost"
        >
          <FiSearch />
        </IconButton>
      </HStack>
      <Avatar.Root bg="white" ml="4" size="sm">
        <Avatar.Fallback name="f2e" />
        <Avatar.Image src={getAvatar('f2e')} />
      </Avatar.Root>
    </Flex>
  );
};

export default Header;
