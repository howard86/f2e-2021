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
import { type Activity, CityMap } from '@f2e/tdx';
import {
  BiChevronRight,
  BiLinkExternal,
  BiMoney,
  BiSync,
} from 'react-icons/bi';
import { BsBookmarkPlusFill, BsPeopleFill } from 'react-icons/bs';
import { FiClock, FiMapPin, FiPhoneIncoming } from 'react-icons/fi';
import { MdManageAccounts, MdPhotoAlbum } from 'react-icons/md';

import GoogleMap from '@/components/google-map';
import RouteLink from '@/components/route-link';
import SceneDetailBox from '@/components/scene-detail-text';

interface ActivityViewProps {
  activity: Activity;
}

const getGoogleMapURL = (lat?: number, lng?: number) =>
  lat && lng
    ? `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`
    : undefined;
const ActivityView = ({ activity }: ActivityViewProps) => {
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
              <RouteLink as={Breadcrumb.Link} href="/">
                活動新訊
              </RouteLink>
            </Breadcrumb.Item>
            <Breadcrumb.Separator>
              <BiChevronRight />
            </Breadcrumb.Separator>
            <Breadcrumb.Item>
              <RouteLink
                as={Breadcrumb.Link}
                href={`/${CityMap[activity.City]}`}
              >
                {activity.City}
              </RouteLink>
            </Breadcrumb.Item>
            <Breadcrumb.Separator>
              <BiChevronRight />
            </Breadcrumb.Separator>
            <Breadcrumb.Item fontWeight="bold">
              <RouteLink
                aria-current="page"
                as={Breadcrumb.Link}
                href={`/${CityMap[activity.City]}/activity/${
                  activity.ActivityID
                }`}
              >
                {activity.ActivityName}
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
              alt={
                activity.Picture?.PictureDescription1 || activity.ActivityName
              }
              fit="cover"
              height={[400, 600]}
              loading="lazy"
              // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
              onError={(event) => {
                event.currentTarget.src = '/static/fallback-lg.jpg';
              }}
              src={activity.Picture?.PictureUrl1}
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
              {activity.ActivityName}
            </Heading>
            {Boolean(activity.Description) && (
              <Text lineClamp={10}>{activity.Description}</Text>
            )}
            {Boolean(activity.TravelInfo) && (
              <Text lineClamp={10}>{activity.TravelInfo}</Text>
            )}
            {Boolean(activity.ParkingInfo) && (
              <Text lineClamp={10}>{activity.ParkingInfo}</Text>
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
                  activity.MapUrl ||
                  getGoogleMapURL(
                    activity.Position?.PositionLat,
                    activity.Position?.PositionLon,
                  )
                }
                icon={FiMapPin}
                info={
                  activity.Address ||
                  (activity.Position?.PositionLat &&
                    activity.Position?.PositionLon &&
                    '查看地圖')
                }
                label="地址"
              />
              <SceneDetailBox
                href={`tel:${activity.Phone}`}
                icon={FiPhoneIncoming}
                info={activity.Phone}
                label="電話"
              />
              <SceneDetailBox
                icon={BiMoney}
                info={activity.Charge}
                label="費用"
              />
              <SceneDetailBox
                icon={FiClock}
                info={
                  activity.StartTime &&
                  activity.EndTime &&
                  `${new Date(
                    activity.StartTime,
                  ).toLocaleDateString()}~${new Date(
                    activity.EndTime,
                  ).toLocaleDateString()}`
                }
                label="活動時間"
              />
              <SceneDetailBox
                href={activity.WebsiteUrl}
                icon={BiLinkExternal}
                info={activity.WebsiteUrl && '官網'}
                label="相關鏈結"
              />
              <SceneDetailBox
                icon={MdManageAccounts}
                info={activity.Organizer}
                label="主辦方"
              />
              <SceneDetailBox
                icon={MdPhotoAlbum}
                info={[activity.Class1, activity.Class2]
                  .filter(Boolean)
                  .join(', ')}
                label="主題"
              />
              <SceneDetailBox
                icon={BsPeopleFill}
                info={activity.Particpation}
                label="參與對象"
              />
              <SceneDetailBox
                icon={BiSync}
                info={
                  activity.SrcUpdateTime &&
                  new Date(activity.SrcUpdateTime).toLocaleDateString()
                }
                label="更新時間"
              />
            </VStack>
          </Box>
          {Boolean(
            activity.Position?.PositionLat && activity.Position?.PositionLon,
          ) && (
            <GoogleMap
              lat={activity.Position.PositionLat}
              lng={activity.Position.PositionLon}
              query={activity.Address}
            />
          )}
        </SimpleGrid>
      </Flex>
    </>
  );
};

export default ActivityView;
