'use client';

import {
  Box,
  Flex,
  Image,
  LinkBox,
  type LinkBoxProps,
  LinkOverlay,
  Text,
} from '@chakra-ui/react';

import RouteLink from './route-link';

interface ThemeCardProps extends LinkBoxProps {
  href?: string;
  id: string;
  image: string;
  theme: string;
}

const ThemeCard = ({ id, theme, image, href, ...props }: ThemeCardProps) => (
  <LinkBox h="420" overflow="hidden" pos="relative" rounded="3xl" {...props}>
    <Image
      alt={theme}
      h="full"
      objectFit="cover"
      objectPosition="center"
      // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
      onError={(event) => {
        event.currentTarget.src = '/static/fallback.jpg';
      }}
      src={image}
      w="full"
    />
    <Flex
      _hover={{
        bgColor: 'blackAlpha.600',
      }}
      bottom="0"
      flexDir="column"
      left="0"
      pos="absolute"
      right="0"
      top="0"
      transition="ease-out"
      transitionDuration="0.2s"
      zIndex="docked"
    >
      <Box flexGrow={1} />
      <Box>
        <Text
          as="h3"
          bgColor="blackAlpha.600"
          color="white"
          fontSize={['xl', '2xl']}
          fontWeight="bold"
          p="4"
        >
          {href ? (
            <LinkOverlay href={href} rel="noreferrer" target="_blank">
              {theme}
            </LinkOverlay>
          ) : (
            <RouteLink as={LinkOverlay} href={`/scenes/${theme}`}>
              {theme}
            </RouteLink>
          )}
        </Text>
      </Box>
    </Flex>
  </LinkBox>
);

export default ThemeCard;
