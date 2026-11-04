import { Box, Container, Flex, SimpleGrid, Text } from '@chakra-ui/react';
import type { Metadata } from 'next';
import Image from 'next/image';

import Banner from '@/components/banner';
import Logo from '@/components/icons/logo';
import Layout from '@/components/layout/layout';
import PlaceCard from '@/components/place-card';
import SceneCard from '@/components/scene-card';
import SiteCardGrid from '@/components/site-card-grid';
import WeatherCarousel from '@/components/weather-carousel';
import { SCENES_PAGE_PROPS } from '@/constants/page-props';
import { DEFAULT_FETCHED_REMARK_NUMBER } from '@/constants/pagination';
import {
  mapActivityToPlaceCard,
  mapHotelToPlaceCard,
  mapRestaurantToPlaceCard,
  mapScenicSpotToSceneCard,
  tourismService,
} from '@/services/tdx';
import getWeathers from '@/services/weather';
import mainBackground from '@/static/background/main.png';

export const revalidate = 21_600;

export const metadata: Metadata = {
  openGraph: {
    images: ['/static/background/main.png'],
  },
};

const PAGE_PROPS = SCENES_PAGE_PROPS;

const HomePage = async () => {
  const [weathers, scenes, restaurants, hotels, activities] = await Promise.all(
    [
      getWeathers(),
      tourismService.getScenicSpots({
        filter: 'Picture/PictureUrl1 ne null and City ne null',
        orderBy: 'SrcUpdateTime desc, TicketInfo desc',
        select: 'ScenicSpotID,ScenicSpotName,City,Picture',
        top: DEFAULT_FETCHED_REMARK_NUMBER,
      }),
      tourismService.getRestaurants({
        filter:
          'Picture/PictureUrl1 ne null and Address ne null and City ne null',
        orderBy: 'SrcUpdateTime desc, Description desc',
        select:
          'RestaurantID,RestaurantName,City,Address,OpenTime,Phone,Picture',
        top: DEFAULT_FETCHED_REMARK_NUMBER,
      }),
      tourismService.getHotels({
        filter:
          'Picture/PictureUrl1 ne null and Address ne null and City ne null',
        orderBy: 'SrcUpdateTime desc, ServiceInfo desc',
        select: 'HotelID,HotelName,City,Address,ServiceInfo,Phone,Picture',
        top: DEFAULT_FETCHED_REMARK_NUMBER,
      }),
      tourismService.getActivities({
        filter: 'Picture/PictureUrl1 ne null and Address ne null',
        orderBy: 'StartTime desc',
        select:
          'ActivityID,ActivityName,City,Address,StartTime,EndTime,Phone,Picture',
        top: DEFAULT_FETCHED_REMARK_NUMBER,
      }),
    ],
  );

  return (
    <Layout {...PAGE_PROPS}>
      <Container centerContent h="100vh" maxH={[400, 700]}>
        <Box
          bg="scenes.light"
          h="inherit"
          left="0"
          maxH="inherit"
          overflow="hidden"
          pos="absolute"
          right="0"
          top="0"
          zIndex="hide"
        >
          <Image
            alt="首頁背景"
            fill
            placeholder="blur"
            sizes="100vw"
            src={mainBackground}
            style={{
              objectFit: 'cover',
              objectPosition: '50% bottom',
            }}
          />
        </Box>
        <Logo
          color="whiteAlpha.700"
          h="auto"
          maxH="117"
          maxW="152"
          my={[8, 12]}
          w="30%"
        />
      </Container>
      <Flex
        bgGradient="to-b"
        flexDir="column"
        gradientFrom={PAGE_PROPS.gradientColor}
        gradientTo="white"
        justify="center"
        minH="360"
        py="14"
      >
        <Container maxW="container.md" px="0" textAlign="center">
          <Text color="blackAlpha.500" mx="8" textStyle="subtitle">
            台灣許多美景媲美國外，值此五倍券、國旅券及觀光業者加碼優惠盡出之際，旅行台灣就是現在！
            到哪裡旅遊還沒有想法的民眾，歡迎到台灣觀光，體驗「台灣之美」!
          </Text>
          <WeatherCarousel weathers={weathers} />
        </Container>
      </Flex>
      <Flex bgColor="white" flexDir="column">
        <SiteCardGrid maxW="container.lg" mx="auto" />

        <Banner
          href="/scenes"
          mainColor={PAGE_PROPS.mainColor}
          title="熱門景點"
        />
        <SimpleGrid columns={[1, 2, 3]} gap={6} mx="8">
          {scenes.map(mapScenicSpotToSceneCard).map((item) => (
            <SceneCard key={item.href} {...item} />
          ))}
        </SimpleGrid>

        <Banner
          hideButton
          href="/scenes"
          mainColor="activities.main"
          title="最新活動"
        />
        <SimpleGrid columns={[1, 2, 3]} gap={6} mx="8">
          {activities.map(mapActivityToPlaceCard).map((activity) => (
            <PlaceCard key={activity.href} {...activity} />
          ))}
        </SimpleGrid>

        <Banner
          href="/restaurants"
          mainColor="restaurants.main"
          title="熱門美食"
        />

        <SimpleGrid columns={[1, 2, 3]} gap={6} mx="8">
          {restaurants.map(mapRestaurantToPlaceCard).map((item) => (
            <PlaceCard key={item.href} {...item} />
          ))}
        </SimpleGrid>
        <Banner href="/hotels" mainColor="hotels.main" title="住宿推薦" />

        <SimpleGrid columns={[1, 2, 3]} gap={6} mx="8">
          {hotels.map(mapHotelToPlaceCard).map((item) => (
            <PlaceCard key={item.href} {...item} />
          ))}
        </SimpleGrid>
      </Flex>
    </Layout>
  );
};

export default HomePage;
