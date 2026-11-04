'use client';

import {
  Box,
  Flex,
  Icon,
  Image,
  LinkBox,
  type LinkBoxProps,
  LinkOverlay,
  Text,
} from '@chakra-ui/react';
import { FiMapPin } from 'react-icons/fi';

import CardBanner from './card-banner';
import RouteLink from './route-link';

export interface SceneCardProps extends LinkBoxProps {
  city: string;
  href: string;
  image: string;
  name: string;
}

const SceneCard = ({ name, city, image, href }: SceneCardProps) => (
  <LinkBox
    h={['380px', '420px', '420px', '500px']}
    overflow="hidden"
    pos="relative"
    rounded="2xl"
  >
    <Image
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
      {/* TODO: add rate & view */}
      <CardBanner rate={(name.length % 3) + 2} saved view={name.length} />
      <Box flexGrow={1} />
      <Flex
        bgColor="blackAlpha.500"
        color="white"
        display="flex"
        flexDir="column"
        p="4"
        roundedBottom="3xl"
        zIndex="docked"
      >
        <Text textStyle="headline-3">
          <RouteLink as={LinkOverlay} href={href}>
            {name}
          </RouteLink>
        </Text>
        <Flex align="center" alignSelf="flex-end">
          <Icon as={FiMapPin} boxSize="24px" mr="1" />
          <Text as="span">{city}</Text>
        </Flex>
      </Flex>
    </Flex>
  </LinkBox>
);

export default SceneCard;
