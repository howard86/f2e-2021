'use client';

import {
  Flex,
  type FlexProps,
  Icon,
  Image,
  LinkBox,
  LinkOverlay,
  Text,
} from '@chakra-ui/react';
import { FiMapPin } from 'react-icons/fi';

import CardBanner from './card-banner';
import RouteLink from './route-link';

export interface PlaceCardProps extends FlexProps {
  address: string;
  city: string;
  contactNumber?: string;
  href: string;
  image: string;
  name: string;
  openingHours?: string;
  serviceInfo?: string;
}

const PlaceCard = ({
  name,
  city,
  address,
  openingHours,
  contactNumber,
  serviceInfo,
  image,
  href,
}: PlaceCardProps) => (
  <LinkBox
    _hover={{
      boxShadow: '12px 12px 10px',
      color: 'blackAlpha.400',
    }}
    border="1px"
    borderColor="blackAlpha.600"
    display="flex"
    flexDir="column"
    overflow="hidden"
    pos="relative"
    rounded="2xl"
    transition="ease-out"
    transitionDuration="0.2s"
  >
    {/* TODO: add rate & view */}
    <CardBanner
      left="0"
      pos="absolute"
      rate={(name.length % 3) + 2}
      right="0"
      saved
      top="0"
      view={address.length}
      zIndex="docked"
    />
    <Image
      align="center"
      height={300}
      objectFit="cover"
      // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
      onError={(event) => {
        event.currentTarget.src = '/static/fallback.jpg';
      }}
      src={image}
      w="full"
    />
    <Flex color="text.body" flexDir="column" lineHeight="6" m="4">
      <Flex fontWeight="bold" justify="space-between">
        <Text as="h3" color="blackAlpha.800" fontSize={['lg', 'xl']} my="2">
          <RouteLink as={LinkOverlay} href={href}>
            {name}
          </RouteLink>
        </Text>
        <Flex align="center" flexShrink={0} pb="4" pt="2">
          <Icon as={FiMapPin} boxSize={6} mr="1" />
          <Text as="span">{city}</Text>
        </Flex>
      </Flex>
      <Text fontWeight="bold">{address}</Text>
      {Boolean(contactNumber) && (
        <Text textStyle="body">電話：{contactNumber}</Text>
      )}
      {Boolean(openingHours) && (
        <Text textStyle="body">營業時間：{openingHours}</Text>
      )}
      {Boolean(serviceInfo) && <Text textStyle="body">{serviceInfo}</Text>}
    </Flex>
  </LinkBox>
);

export default PlaceCard;
