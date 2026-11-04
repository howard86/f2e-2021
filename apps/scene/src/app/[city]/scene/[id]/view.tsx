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
import { CityMap } from '@f2e/tdx-core';
import type { ScenicSpot } from '@f2e/tdx-tourism';
import {
  BiChevronRight,
  BiLinkExternal,
  BiMoney,
  BiSync,
} from 'react-icons/bi';
import { BsBookmarkPlusFill, BsLightbulb } from 'react-icons/bs';
import {
  FiClock,
  FiMapPin,
  FiPhoneIncoming,
  FiSearch,
  FiStopCircle,
} from 'react-icons/fi';
import { MdPhotoAlbum } from 'react-icons/md';

import GoogleMap from '@/components/google-map';
import RouteLink from '@/components/route-link';
import SceneDetailBox from '@/components/scene-detail-text';

interface SceneViewProps {
  scene: ScenicSpot;
}

const getGoogleMapURL = (lat?: number, lng?: number) =>
  lat && lng
    ? `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`
    : undefined;
const SceneView = ({ scene }: SceneViewProps) => {
  return (
    <>
      <Flex
        bgGradient="to-b"
        flexDir="column"
        gradientFrom="colorPalette.muted"
        gradientTo="white"
        pt="16"
      >
        <Breadcrumb.Root color="blackAlpha.700" mx="8">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <RouteLink as={Breadcrumb.Link} href="/scenes">
                景點
              </RouteLink>
            </Breadcrumb.Item>
            <Breadcrumb.Separator>
              <BiChevronRight />
            </Breadcrumb.Separator>
            <Breadcrumb.Item>
              <RouteLink as={Breadcrumb.Link} href={`/${CityMap[scene.City]}`}>
                {scene.City}
              </RouteLink>
            </Breadcrumb.Item>
            <Breadcrumb.Separator>
              <BiChevronRight />
            </Breadcrumb.Separator>
            <Breadcrumb.Item fontWeight="bold">
              <RouteLink
                aria-current="page"
                as={Breadcrumb.Link}
                href={`/${CityMap[scene.City]}/scene/${scene.ScenicSpotID}`}
              >
                {scene.ScenicSpotName}
              </RouteLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
        <Flex flexDir={{ base: 'column', lg: 'row' }} m={[4, 8]}>
          <Box flexGrow={1} flexShrink={1} m="2" pos="relative">
            <IconButton
              aria-label="save to favorite"
              color="red.600"
              m="4"
              pos="absolute"
              right="0"
              rounded="full"
              size="lg"
              top="0"
            >
              <BsBookmarkPlusFill />
            </IconButton>
            <Image
              align="center"
              alt={scene.Picture?.PictureDescription1 || scene.ScenicSpotName}
              fit="cover"
              height={[400, 600]}
              loading="lazy"
              // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
              onError={(event) => {
                event.currentTarget.src = '/static/fallback-lg.jpg';
              }}
              src={scene.Picture?.PictureUrl1}
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
              {scene.ScenicSpotName}
            </Heading>
            {Boolean(scene.Description) && (
              <Text lineClamp={10}>{scene.Description}</Text>
            )}
            {Boolean(
              scene.DescriptionDetail &&
                scene.Description !== scene.DescriptionDetail,
            ) && <Text lineClamp={10}>{scene.DescriptionDetail}</Text>}
            {Boolean(scene.TravelInfo) && (
              <Text lineClamp={10}>{scene.TravelInfo}</Text>
            )}
          </Box>
        </Flex>
      </Flex>
      <Flex bg="white" flexDir="column">
        <SimpleGrid columns={[1, 1, 2]} gap={[4, 8]} mx="8">
          <Box>
            <Heading>景點資訊</Heading>
            <VStack align="flex-start" gap={4} mt="8" textAlign="start">
              <SceneDetailBox
                href={
                  scene.MapUrl ||
                  getGoogleMapURL(
                    scene.Position?.PositionLat,
                    scene.Position?.PositionLon,
                  )
                }
                icon={FiMapPin}
                info={
                  scene.Address ||
                  (scene.Position?.PositionLat &&
                    scene.Position?.PositionLon &&
                    '查看地圖')
                }
                label="地址"
              />
              <SceneDetailBox
                href={`tel:${scene.Phone}`}
                icon={FiPhoneIncoming}
                info={scene.Phone}
                label="電話"
              />
              <SceneDetailBox
                icon={FiClock}
                info={scene.OpenTime}
                label="開放時間"
              />
              <SceneDetailBox
                href={scene.WebsiteUrl}
                icon={BiLinkExternal}
                info={scene.WebsiteUrl && '官網'}
                label="相關鏈結"
              />
              <SceneDetailBox
                icon={BiMoney}
                info={scene.TicketInfo}
                label="票價資訊"
              />
              <SceneDetailBox
                href={`/scenes/${scene.Class1 || scene.Class2 || scene.Class3}`}
                icon={MdPhotoAlbum}
                info={[scene.Class1, scene.Class2, scene.Class3]
                  .filter(Boolean)
                  .join(', ')}
                label="主題"
              />
              <SceneDetailBox
                icon={FiSearch}
                info={scene.Keyword}
                label="關鍵字"
              />
              <SceneDetailBox
                icon={FiStopCircle}
                info={scene.Level}
                label="古蹟分級"
              />
              <SceneDetailBox
                icon={BsLightbulb}
                info={scene.Remarks}
                label="相關備註"
              />
              <SceneDetailBox
                icon={BiSync}
                info={
                  scene.SrcUpdateTime &&
                  new Date(scene.SrcUpdateTime).toLocaleDateString()
                }
                label="更新時間"
              />
            </VStack>
          </Box>
          {Boolean(
            scene.Position?.PositionLat && scene.Position?.PositionLon,
          ) && (
            <GoogleMap
              lat={scene.Position.PositionLat}
              lng={scene.Position.PositionLon}
              query={scene.Address}
            />
          )}
        </SimpleGrid>
      </Flex>
    </>
  );
};

export default SceneView;
