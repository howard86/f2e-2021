'use client';

import {
  Box,
  Center,
  Flex,
  Heading,
  IconButton,
  LinkBox,
  LinkOverlay,
  Text,
} from '@chakra-ui/react';
import { type City, CityMap, CitySet } from '@f2e/tdx-core';
import debounce from 'lodash.debounce';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, useEffect, useState } from 'react';
import { BiChevronLeft } from 'react-icons/bi';

import bus from '@/bus.png';
import BusSearchInput from '@/components/bus-search-input';
import Image from '@/components/image';
import NavBarItems from '@/components/nav-bar-items';
import RouteKeyBoard from '@/components/route-key-board';
import { DESKTOP_DISPLAY, MOBILE_DISPLAY } from '@/constants/style';
import { useLazyGetBusRoutesQuery } from '@/services/local';
import station from '@/station.png';
import { getBusRouteDestinations } from '@/utils/bus';
import { addToLocalStorage, getFromLocalStorage } from '@/utils/local-storage';

const CITY_STORAGE_KEY = 'selected-city';
const DEFAULT_SEARCH_STRING = '';
const DEFAULT_CITY = 'Taipei';
const DEBOUNCED_MS = 300;

const CityView = () => {
  const [city, setCity] = useState<City>(() => {
    const cachedCity = getFromLocalStorage(CITY_STORAGE_KEY) as City;

    return CitySet.has(cachedCity) ? cachedCity : DEFAULT_CITY;
  });
  const [searchString, setSearchString] = useState(DEFAULT_SEARCH_STRING);
  const [fetchBusRoute, { data, isSuccess }] = useLazyGetBusRoutesQuery();
  const router = useRouter();

  const onSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchString(event.target.value);
  };

  const onSelectCity = (event: ChangeEvent<HTMLSelectElement>) => {
    addToLocalStorage(CITY_STORAGE_KEY, event.target.value);
    setCity(event.target.value as City);
  };

  const onArrowClick = () => {
    router.back();
  };

  useEffect(() => {
    document.title = `Iro Bus | ${CityMap[city]}`;
  }, [city]);

  useEffect(() => {
    const debouncedFetch = debounce((route?: string) => {
      if (route) {
        fetchBusRoute({ city, route });
      }
    }, DEBOUNCED_MS);

    debouncedFetch(searchString);
  }, [city, fetchBusRoute, searchString]);

  return (
    <Flex color="white" flexDir="column" h="full" pos="relative">
      <Flex align="center" bg="primary.800" justify="space-between" p="4">
        <NavBarItems display={DESKTOP_DISPLAY} />
        <IconButton
          aria-label="back to previous page"
          display={MOBILE_DISPLAY}
          fontSize="4xl"
          onClick={onArrowClick}
          variant="ghost"
        >
          <BiChevronLeft />
        </IconButton>
        <BusSearchInput
          city={city}
          display={MOBILE_DISPLAY}
          onSearch={onSearch}
          onSelectCity={onSelectCity}
          searchString={searchString}
        />
      </Flex>
      <Flex
        flexDir={['column', 'column', 'column', 'row-reverse']}
        flexGrow={1}
        gap={[0, 12, 12, 0]}
        maxW="100vw"
        overflowY="auto"
      >
        <Flex
          borderColor="secondary.900"
          borderWidth={[0, '12px']}
          flexDir="column"
          flexGrow={1}
          mb={[0, 4]}
          minH={400}
          mt={[0, 16]}
          mx={[0, 12]}
          overflowY="auto"
          rounded={['none', '3xl']}
        >
          <Flex bg="primary.700" display={['none', 'flex']} p="4">
            <BusSearchInput
              city={city}
              onSearch={onSearch}
              onSelectCity={onSelectCity}
              searchString={searchString}
            />
          </Flex>
          <Box flex={1} overflowY="auto">
            {isSuccess ? (
              // biome-ignore lint/style/noNestedTernary: the nested branches map the three search states directly.
              data && data.data.length > 0 ? (
                data.data.map((busRoute) => (
                  <LinkBox
                    _active={{ borderColor: 'secondary.200' }}
                    _hover={{ borderColor: 'secondary.200' }}
                    backdropFilter="blur(8px)"
                    bgColor="whiteAlpha.100"
                    border="2px"
                    borderColor="primary.200"
                    key={busRoute.RouteUID}
                    m="4"
                    p="4"
                    rounded="2xl"
                  >
                    <Heading fontSize="2xl" mb="4">
                      <LinkOverlay asChild>
                        <NextLink
                          href={`/city/${city}/${busRoute.RouteName.Zh_tw}`}
                        >
                          {busRoute.RouteName.Zh_tw}
                        </NextLink>
                      </LinkOverlay>
                    </Heading>
                    <Text>{getBusRouteDestinations(busRoute)}</Text>
                  </LinkBox>
                ))
              ) : (
                // TODO: add animation
                <Center bg="primary.500" flexDir="column" h="full">
                  <Image alt="查無公車" placeholder="blur" src={bus} />
                  <Heading fontSize="lg" mt="4">
                    Ooops, 查無公車
                  </Heading>
                </Center>
              )
            ) : (
              <Center bg="primary.500" flexDir="column" h="full">
                <Image
                  alt="請輸入公車路線編號"
                  placeholder="blur"
                  src={station}
                />
                <Heading fontSize="lg" mt="4">
                  請輸入公車路線編號
                </Heading>
              </Center>
            )}
          </Box>
        </Flex>
        <Flex flexDir="column" flexShrink={0}>
          <Box flexGrow={4} />
          <Box
            bg="primary.800"
            borderTopRadius="3xl"
            mx={[0, 12]}
            p={[0, 4]}
            pos="relative"
            shadow="xl"
          >
            <Box
              display={DESKTOP_DISPLAY}
              left="0"
              pos="absolute"
              right="0"
              top="-12"
            >
              <Box
                bg="secondary.800"
                border="2px"
                borderColor="secondary.400"
                fontWeight="bold"
                mx="auto"
                p="4"
                roundedTop="2xl"
                textAlign="center"
                w="120px"
                zIndex="docked"
              >
                快速搜尋
              </Box>
            </Box>
            <RouteKeyBoard setSearchString={setSearchString} />
          </Box>
          <Box flexGrow={1} />
          <Box display={DESKTOP_DISPLAY} ml="16" p="8" pos="relative">
            <Image alt="bus" animation="busBounce 3s ease infinite" src={bus} />
            <Box
              animation="roadTravel 6s ease-out infinite"
              bgGradient="to-r"
              bottom="6"
              gradientFrom="#172E5E"
              gradientTo="#172E5E"
              gradientVia="whiteAlpha.600"
              h="1"
              pos="absolute"
              rounded="2xl"
              w="20"
              zIndex=""
            />
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default CityView;
