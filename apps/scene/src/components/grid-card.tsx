'use client';

import {
  Box,
  Flex,
  GridItem,
  type GridItemProps,
  Image,
  LinkBox,
  LinkOverlay,
  Text,
} from '@chakra-ui/react';

import RouteLink from './route-link';

interface GridCardProps extends GridItemProps {
  href: string;
  image: string;
  isExternal?: boolean;
  subtitle?: string;
  title: string;
}

const GridCard = ({
  title,
  subtitle,
  image,
  href,
  isExternal,
  ...props
}: GridCardProps) => (
  <GridItem
    as={LinkBox}
    overflow="hidden"
    pos="relative"
    rounded="2xl"
    {...props}
  >
    <Image
      align="center"
      alt={title}
      fit="cover"
      h="full"
      // biome-ignore lint/performance/noJsxPropsBind: native image fallback needs the current event target.
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
      color="white"
      flexDir="column"
      left="0"
      p={[2, 4]}
      pos="absolute"
      right="0"
      top="0"
      transition="ease-out"
      transitionDuration="0.2s"
      zIndex="docked"
    >
      {isExternal ? (
        <LinkOverlay
          fontSize="lg"
          fontWeight="bold"
          href={href}
          rel="noreferrer"
          target="_blank"
        >
          {title}
        </LinkOverlay>
      ) : (
        <RouteLink as={LinkOverlay} href={href}>
          {title}
        </RouteLink>
      )}
      <Text>{subtitle}</Text>
      <Box flexGrow={1} />
    </Flex>
  </GridItem>
);

export default GridCard;
