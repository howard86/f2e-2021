'use client';

import {
  Box,
  Center,
  Flex,
  IconButton,
  Input,
  InputGroup,
  SimpleGrid,
  useDisclosure,
} from '@chakra-ui/react';
import type React from 'react';
import { type ChangeEvent, useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';

import Background from '@/components/background';
import BackgroundCard from '@/components/background-card';
import Banner from '@/components/banner';
import LoadingScreen from '@/components/loading-screen';
import Pagination from '@/components/pagination';
import PlaceCard, { type PlaceCardProps } from '@/components/place-card';
import { RESTAURANTS_PAGE_PROPS } from '@/constants/page-props';
import { DEFAULT_CARD_NUMBER } from '@/constants/pagination';
import useAppToast from '@/hooks/use-app-toast';
import { useLazyGetRestaurantCardsQuery } from '@/services/local';
import background from '@/static/background/restaurants.png';
import wordOne from '@/static/background/restaurants-1.png';
import wordTwo from '@/static/background/restaurants-2.png';

interface RestaurantsViewProps {
  restaurants: PlaceCardProps[];
}

const PAGE_PROPS = RESTAURANTS_PAGE_PROPS;

const RestaurantsView = ({
  restaurants,
}: RestaurantsViewProps): React.ReactElement => {
  const toast = useAppToast();
  const [fetch, { data, isUninitialized, isLoading, isError, originalArgs }] =
    useLazyGetRestaurantCardsQuery();

  const messageSentStatus = useDisclosure();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);

  const onSearch = () => {
    fetch({ keyword: keyword.trim() });
    messageSentStatus.onOpen();
  };

  const handleOnType = (event: ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };

  useEffect(() => {
    if (isError && messageSentStatus.open) {
      toast({
        description: `查無"${keyword.trim()}"的結果`,
        status: 'warning',
      });
      messageSentStatus.onClose();
    }
  }, [isError, keyword, messageSentStatus, messageSentStatus.open, toast]);

  return (
    <>
      <Background
        bgColor={PAGE_PROPS.gradientColor}
        image={background}
        name="美食"
        wordOne={wordOne}
        wordOneAlt="美"
        wordTwo={wordTwo}
        wordTwoAlt="食"
      >
        <InputGroup
          endElement={
            <IconButton
              aria-label="search"
              onClick={onSearch}
              rounded="full"
              variant="ghost"
            >
              <FiSearch />
            </IconButton>
          }
          endElementProps={{ pointerEvents: 'auto' }}
          maxW="container.md"
          my="8"
        >
          <Input
            bg="white"
            onChange={handleOnType}
            placeholder="請輸入關鍵字"
            rounded="2xl"
            size="lg"
            value={keyword}
          />
        </InputGroup>
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
        gradientFrom={PAGE_PROPS.gradientColor}
        gradientTo="white"
        h={['40px', '120px', '220px']}
      />
      <Flex bg="white" flexDir="column">
        {!(isUninitialized || isError) && (
          <>
            <Banner
              hideButton
              href="/scenes"
              mainColor={PAGE_PROPS.mainColor}
              mt="0"
              title={`搜尋『${originalArgs?.keyword}』的結果...`}
            />
            {Boolean(isLoading) && (
              <LoadingScreen mainColor={PAGE_PROPS.mainColor} />
            )}
            {data?.success === true && (
              <SimpleGrid columns={[1, 2, 3]} gap={6} mx="8">
                {data.data.map((restaurant) => (
                  <PlaceCard key={restaurant.href} {...restaurant} />
                ))}
              </SimpleGrid>
            )}
          </>
        )}
        <Banner
          hideButton
          href="/scenes"
          mainColor={PAGE_PROPS.mainColor}
          title="熱門美食"
        />
        <SimpleGrid columnGap={8} columns={[1, 2, 3]} mx="8" rowGap={12}>
          {restaurants
            .slice(
              DEFAULT_CARD_NUMBER * page,
              DEFAULT_CARD_NUMBER * page + DEFAULT_CARD_NUMBER,
            )
            .map((restaurant) => (
              <PlaceCard key={restaurant.href} {...restaurant} />
            ))}
        </SimpleGrid>
        <Center mt="8">
          <Pagination
            colorTheme="restaurants"
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
