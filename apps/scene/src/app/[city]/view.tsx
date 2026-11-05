'use client';

import {
  Box,
  Breadcrumb,
  Center,
  Flex,
  Heading,
  SimpleGrid,
} from '@chakra-ui/react';
import { type City, CityMap } from '@f2e/tdx-core';
import { RouteLink } from '@f2e/ui/links';
import { useState } from 'react';
import { BiChevronRight } from 'react-icons/bi';
import Background from '@/components/background';
import Pagination from '@/components/pagination';
import PlaceCard, { type PlaceCardProps } from '@/components/place-card';
import SceneCard, { type SceneCardProps } from '@/components/scene-card';
import SectionBanner from '@/components/section-banner';
import { DEFAULT_CARD_NUMBER } from '@/constants/pagination';
import background from '@/static/background/scenes.png';
import wordOne from '@/static/background/scenes-1.png';
import wordTwo from '@/static/background/scenes-2.png';

interface CityPageProps {
  activities: PlaceCardProps[];
  city: City;
  hotels: PlaceCardProps[];
  restaurants: PlaceCardProps[];
  scenes: SceneCardProps[];
}

const CityView = ({
  city,
  scenes,
  restaurants,
  hotels,
  activities,
}: CityPageProps) => {
  const [scenePage, setScenePage] = useState(0);
  const [restaurantPage, setRestaurantPage] = useState(0);
  const [hotelPage, setHotelPage] = useState(0);
  const [activityPage, setActivityPage] = useState(0);

  return (
    <>
      <Background
        bgColor="colorPalette.muted"
        image={background}
        name="景點"
        wordOne={wordOne}
        wordOneAlt="景"
        wordTwo={wordTwo}
        wordTwoAlt="點"
      >
        {/* TODO: add BackgroundCard */}
        <Flex align="center" mt="8" />
      </Background>

      <Flex bg="white" flexDir="column">
        <Breadcrumb.Root color="blackAlpha.700" m="4">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <RouteLink as={Breadcrumb.Link} href="/">
                景點
              </RouteLink>
            </Breadcrumb.Item>
            <Breadcrumb.Separator>
              <BiChevronRight />
            </Breadcrumb.Separator>
            <Breadcrumb.Item fontWeight="bold">
              <RouteLink
                aria-current="page"
                as={Breadcrumb.Link}
                href={`/${city}`}
              >
                {CityMap[city]}
              </RouteLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
        <Heading as="h1" mb="4" textAlign="center">
          {CityMap[city]}
        </Heading>
        {activities.length > 0 && (
          <Box colorPalette="activities">
            <SectionBanner title="最新活動" />
            <SimpleGrid columns={[1, 2, 3]} gap={6} mx="8">
              {activities
                .slice(
                  DEFAULT_CARD_NUMBER * activityPage,
                  DEFAULT_CARD_NUMBER * activityPage + DEFAULT_CARD_NUMBER,
                )
                .map((activity) => (
                  <PlaceCard key={activity.href} {...activity} />
                ))}
            </SimpleGrid>
            <Center mt="8">
              <Pagination
                onPageChange={setActivityPage}
                page={activityPage}
                total={Math.ceil(activities.length / DEFAULT_CARD_NUMBER)}
              />
            </Center>
          </Box>
        )}
        {scenes.length > 0 && (
          <Box colorPalette="scenes">
            <SectionBanner title="熱門景點" />
            <SimpleGrid columns={[1, 2, 3]} gap={6} mx="8">
              {scenes
                .slice(
                  scenePage * DEFAULT_CARD_NUMBER,
                  scenePage * DEFAULT_CARD_NUMBER + DEFAULT_CARD_NUMBER,
                )
                .map((scene) => (
                  <SceneCard key={scene.href} {...scene} />
                ))}
            </SimpleGrid>
            <Center mt="8">
              <Pagination
                onPageChange={setScenePage}
                page={scenePage}
                total={Math.ceil(scenes.length / DEFAULT_CARD_NUMBER)}
              />
            </Center>
          </Box>
        )}
        {restaurants.length > 0 && (
          <Box colorPalette="restaurants">
            <SectionBanner title="熱門美食" />
            <SimpleGrid columns={[1, 2, 3]} gap={6} mx="8">
              {restaurants
                .slice(
                  DEFAULT_CARD_NUMBER * restaurantPage,
                  DEFAULT_CARD_NUMBER * restaurantPage + DEFAULT_CARD_NUMBER,
                )
                .map((restaurant) => (
                  <PlaceCard key={restaurant.href} {...restaurant} />
                ))}
            </SimpleGrid>
            <Center mt="8">
              <Pagination
                onPageChange={setRestaurantPage}
                page={restaurantPage}
                total={Math.ceil(restaurants.length / DEFAULT_CARD_NUMBER)}
              />
            </Center>
          </Box>
        )}
        {hotels.length > 0 && (
          <Box colorPalette="hotels">
            <SectionBanner title="住宿推薦" />
            <SimpleGrid columns={[1, 2, 3]} gap={6} mx="8">
              {hotels
                .slice(
                  DEFAULT_CARD_NUMBER * hotelPage,
                  DEFAULT_CARD_NUMBER * hotelPage + DEFAULT_CARD_NUMBER,
                )
                .map((hotel) => (
                  <PlaceCard key={hotel.href} {...hotel} />
                ))}
            </SimpleGrid>
            <Center mt="8">
              <Pagination
                onPageChange={setHotelPage}
                page={hotelPage}
                total={Math.ceil(hotels.length / DEFAULT_CARD_NUMBER)}
              />
            </Center>
          </Box>
        )}
      </Flex>
    </>
  );
};

export default CityView;
