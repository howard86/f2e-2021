'use client';

import { Box, Center, Flex, SimpleGrid } from '@chakra-ui/react';
import type React from 'react';
import { useState } from 'react';

import Background from '@/components/background';
import BackgroundCard from '@/components/background-card';
import Pagination from '@/components/pagination';
import PlaceCard, { type PlaceCardProps } from '@/components/place-card';
import SearchBar from '@/components/search-bar';
import SearchResults from '@/components/search-list-view';
import SectionBanner from '@/components/section-banner';
import { DEFAULT_CARD_NUMBER } from '@/constants/pagination';
import useKeywordSearch from '@/hooks/use-keyword-search';
import { useLazyGetRestaurantCardsQuery } from '@/services/local';
import background from '@/static/background/restaurants.png';
import wordOne from '@/static/background/restaurants-1.png';
import wordTwo from '@/static/background/restaurants-2.png';

interface RestaurantsViewProps {
  restaurants: PlaceCardProps[];
}

const renderRestaurant = (restaurant: PlaceCardProps) => (
  <PlaceCard key={restaurant.href} {...restaurant} />
);

const RestaurantsView = ({
  restaurants,
}: RestaurantsViewProps): React.ReactElement => {
  const search = useKeywordSearch<PlaceCardProps>(
    useLazyGetRestaurantCardsQuery(),
  );
  const [page, setPage] = useState(0);

  return (
    <>
      <Background
        bgColor="colorPalette.muted"
        image={background}
        name="美食"
        wordOne={wordOne}
        wordOneAlt="美"
        wordTwo={wordTwo}
        wordTwoAlt="食"
      >
        <SearchBar
          maxW="3xl"
          my="8"
          onSubmit={search.search}
          onValueChange={search.setKeyword}
          value={search.keyword}
        />
        <SimpleGrid columns={3} gap={[2, 0]} h={['160px', '220px']}>
          <BackgroundCard
            image="/static/card/restaurants-1.png"
            name="台灣文化"
            roundedRight="none"
          />
          <BackgroundCard
            image="/static/card/restaurants-2.png"
            name="台灣小吃"
            rounded="none"
          />
          <BackgroundCard
            image="/static/card/restaurants-3.png"
            name="台灣各地特色"
            roundedLeft="none"
          />
        </SimpleGrid>
      </Background>
      <Box
        bgGradient="to-b"
        gradientFrom="colorPalette.muted"
        gradientTo="white"
        h={['40px', '120px', '220px']}
      />
      <Flex bg="white" flexDir="column">
        <SearchResults renderItem={renderRestaurant} search={search} />
        <SectionBanner title="熱門美食" />
        <SimpleGrid columnGap={8} columns={[1, 2, 3]} mx="8" rowGap={12}>
          {restaurants
            .slice(
              DEFAULT_CARD_NUMBER * page,
              DEFAULT_CARD_NUMBER * page + DEFAULT_CARD_NUMBER,
            )
            .map(renderRestaurant)}
        </SimpleGrid>
        <Center mt="8">
          <Pagination
            onPageChange={setPage}
            page={page}
            total={Math.ceil(restaurants.length / DEFAULT_CARD_NUMBER)}
          />
        </Center>
      </Flex>
    </>
  );
};

export default RestaurantsView;
