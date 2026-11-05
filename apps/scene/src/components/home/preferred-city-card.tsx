'use client';

import { Flex, Icon, Text } from '@chakra-ui/react';
import { CityMap } from '@f2e/tdx-core';
import { RouteLink } from '@f2e/ui/links';
import { FiArrowRight, FiMapPin } from 'react-icons/fi';

import usePreferredCity from '@/hooks/use-preferred-city';

/**
 * The home page stays static for every visitor, so the preferred city shows
 * up here as a shortcut to that city's guide instead of filtering the page.
 */
const PreferredCityCard = () => {
  const { city, ready } = usePreferredCity();

  if (!(ready && city)) {
    return null;
  }

  return (
    <RouteLink
      _hover={{ bg: 'colorPalette.muted' }}
      bg="colorPalette.subtle"
      borderColor="colorPalette.muted"
      borderWidth="1px"
      colorPalette="scenes"
      href={`/${city}`}
      px="5"
      py="4"
      rounded="lg"
      textDecoration="none"
    >
      <Flex align="center" gap="3" w="full">
        <Icon color="colorPalette.fg" flexShrink={0}>
          <FiMapPin />
        </Icon>
        <Text flex="1" textStyle="body">
          你的偏好縣市是
          <Text as="strong" color="colorPalette.fg" mx="1">
            {CityMap[city]}
          </Text>
          ，查看當地景點、美食、住宿與活動
        </Text>
        <Icon color="colorPalette.fg" flexShrink={0}>
          <FiArrowRight />
        </Icon>
      </Flex>
    </RouteLink>
  );
};

export default PreferredCityCard;
