'use client';

import {
  Box,
  Breadcrumb,
  Flex,
  Heading,
  IconButton,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { CityMap, type Restaurant } from '@f2e/tdx';
import { BiChevronRight, BiLinkExternal, BiSync } from 'react-icons/bi';
import { BsBookmarkPlus } from 'react-icons/bs';
import { FiClock, FiMapPin, FiPhoneIncoming } from 'react-icons/fi';
import { MdPhotoAlbum } from 'react-icons/md';

import GoogleMap from '@/components/google-map';
import RouteLink from '@/components/route-link';
import SceneDetailBox from '@/components/scene-detail-text';

interface RestaurantViewProps {
  restaurant: Restaurant;
}

const getGoogleMapURL = (lat?: number, lng?: number) =>
  lat && lng
    ? `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`
    : undefined;
const RestaurantView = ({ restaurant }: RestaurantViewProps) => {
  return (
    <>
      <Flex
        bgGradient="to-b"
        flexDir="column"
        gradientFrom="restaurants.light"
        gradientTo="white"
        pt="16"
      >
        <Breadcrumb.Root color="blackAlpha.700" mx="8">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <RouteLink as={Breadcrumb.Link} href="/restaurants">
                美食
              </RouteLink>
            </Breadcrumb.Item>
            <Breadcrumb.Separator>
              <BiChevronRight />
            </Breadcrumb.Separator>
            <Breadcrumb.Item>
              <RouteLink
                as={Breadcrumb.Link}
                href={`/${CityMap[restaurant.City]}`}
              >
                {restaurant.City}
              </RouteLink>
            </Breadcrumb.Item>
            <Breadcrumb.Separator>
              <BiChevronRight />
            </Breadcrumb.Separator>
            <Breadcrumb.Item fontWeight="bold">
              <RouteLink
                aria-current="page"
                as={Breadcrumb.Link}
                href={`/${CityMap[restaurant.City]}/restaurant/${
                  restaurant.RestaurantID
                }`}
              >
                {restaurant.RestaurantName}
              </RouteLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
        <Flex flexDir={{ base: 'column', lg: 'row' }} m={[4, 8]}>
          <Box flexGrow={1} flexShrink={1} m="2" pos="relative">
            <IconButton
              aria-label="save to favorite"
              color="blackAlpha.600"
              m="4"
              pos="absolute"
              right="0"
              rounded="full"
              size="lg"
              top="0"
            >
              <BsBookmarkPlus />
            </IconButton>
            <Image
              align="center"
              alt={
                restaurant.Picture?.PictureDescription1 ||
                restaurant.RestaurantName
              }
              fit="cover"
              height={[400, 600]}
              loading="lazy"
              // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
              onError={(event) => {
                event.currentTarget.src = '/static/fallback-lg.jpg';
              }}
              src={restaurant.Picture?.PictureUrl1}
              width={[600, 900]}
            />
          </Box>
          <Box
            css={{ '& p': { my: 2 } }}
            flexGrow={1}
            flexShrink={3}
            lineHeight="7"
          >
            <Heading mb="4" textAlign="center">
              {restaurant.RestaurantName}
            </Heading>
            {Boolean(restaurant.Description) && (
              <Text lineClamp={10}>{restaurant.Description}</Text>
            )}
            {Boolean(restaurant.ParkingInfo) && (
              <Text lineClamp={10}>{restaurant.ParkingInfo}</Text>
            )}
          </Box>
        </Flex>
      </Flex>
      <Flex bg="white" flexDir="column">
        <SimpleGrid columns={[1, 1, 2]} gap={[4, 8]} mx="8">
          <Box>
            <Heading>餐廳資訊</Heading>
            <VStack align="flex-start" gap={4} mt="8" textAlign="start">
              <SceneDetailBox
                href={
                  restaurant.MapUrl ||
                  getGoogleMapURL(
                    restaurant.Position?.PositionLat,
                    restaurant.Position?.PositionLon,
                  )
                }
                icon={FiMapPin}
                info={
                  restaurant.Address ||
                  (restaurant.Position?.PositionLat &&
                    restaurant.Position?.PositionLon &&
                    '查看地圖')
                }
                label="地址"
              />
              <SceneDetailBox
                href={`tel:${restaurant.Phone}`}
                icon={FiPhoneIncoming}
                info={restaurant.Phone}
                label="電話"
              />
              <SceneDetailBox
                icon={FiClock}
                info={restaurant.OpenTime}
                label="開放時間"
              />
              <SceneDetailBox
                href={restaurant.WebsiteUrl}
                icon={BiLinkExternal}
                info={restaurant.WebsiteUrl && '官網'}
                label="相關鏈結"
              />
              <SceneDetailBox
                icon={MdPhotoAlbum}
                info={restaurant.Class}
                label="分類"
              />
              <SceneDetailBox
                icon={BiSync}
                info={
                  restaurant.SrcUpdateTime &&
                  new Date(restaurant.SrcUpdateTime).toLocaleDateString()
                }
                label="更新時間"
              />
            </VStack>
          </Box>
          {Boolean(
            restaurant.Position?.PositionLat &&
              restaurant.Position?.PositionLon,
          ) && (
            <GoogleMap
              lat={restaurant.Position.PositionLat}
              lng={restaurant.Position.PositionLon}
              query={restaurant.Address}
            />
          )}
        </SimpleGrid>
      </Flex>
    </>
  );
};

export default RestaurantView;
