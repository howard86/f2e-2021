import React, { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Circle,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Flex,
  Heading,
  HStack,
  IconButton,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TabsProps,
  Text,
  useBreakpointValue,
  useDisclosure,
  useTheme,
  VStack,
} from '@chakra-ui/react';
import {
  BusDirection,
  BusRouteDetail,
  BusStopStatus,
  CITIES,
  CitySlug,
  CitySlugMap,
  getBusRouteDetailByCityAndRouteName,
  getBusRouteShapeByCityAndRouteName,
  getRouteStopsByCityAndRouteName,
  RouteStop,
} from '@f2e/ptx';
import type { EntityId } from '@reduxjs/toolkit';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { useRouter } from 'next/router';
import NextHeadSeo from 'next-head-seo';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { BsInfoCircle } from 'react-icons/bs';
import { IoHome } from 'react-icons/io5';
import { MdClose } from 'react-icons/md';
import { GeoJSONLineString, parse } from 'wellknown';

import background from '@/background-small.png';
import bus from '@/bus.png';
import BusRouteInfoModal from '@/components/BusRouteInfoModal';
import Image from '@/components/Image';
import { DESKTOP_MAP_LEFT } from '@/components/Layout';
import { useMap } from '@/components/MapContextProvider';
import NavBarItems from '@/components/NavBarItems';
import { DESKTOP_DISPLAY, MOBILE_DISPLAY } from '@/constants/style';
import {
  busEstimationSelector,
  useGetBusEstimationQuery,
} from '@/services/local';
import { getLastElement, getMiddleElement } from '@/utils/array';
import { getTwoDigitString } from '@/utils/string';

interface BusRoutePageProps {
  citySlug: CitySlug;
  routeName: string;
  geoJson: GeoJSONLineString;
  route: BusRouteDetail;
  directions: BusDirection[];
  routeStopEntity: RouteStopEntity;
}

enum ZoomLevel {
  Stop = 16,
  Stops = 15,
  Marker = 13.5,
  City = 12,
}

type RouteStopEntity = Record<BusDirection, RouteStop>;

const INITIAL_ID = '';
const STOP_LIST_MAX_HEIGHT = 'calc(100vh - 144px)';

const BusRoutePage = ({
  citySlug,
  routeName,
  route,
  geoJson,
  directions,
  routeStopEntity,
}: BusRoutePageProps) => {
  const theme = useTheme();
  const router = useRouter();
  const tabsProps = useBreakpointValue<Omit<TabsProps, 'children'>>({
    base: { variant: 'solid-rounded' },
    md: { isFitted: true, variant: 'line' },
  });
  const buttonVariant = useBreakpointValue({ base: 'ghost', md: 'solid' });
  const [selectedDirection, setSelectedDirection] = useState<BusDirection>(
    BusDirection.去程,
  );
  const [selectedStopId, setSelectedStopId] = useState<EntityId>(INITIAL_ID);
  const { divRef, mapContextRef, isLoaded, setLoaded } = useMap();
  // TODO: refactor with useReducer
  const extendDisclosure = useDisclosure();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const stopDisclosure = useDisclosure();
  const { data, selectedStop } = useGetBusEstimationQuery(
    { city: citySlug, route: routeName },
    {
      skip: router.isFallback,
      selectFromResult: (res) => ({
        ...res,
        selectedStop:
          res.data &&
          busEstimationSelector.selectById(res.data, selectedStopId),
      }),
    },
  );

  // as bus direction might only be 迴圈
  const selectedBusRoute =
    routeStopEntity?.[selectedDirection] || routeStopEntity?.[directions[0]];

  const onDrawerClose = () => {
    stopDisclosure.onClose();
    extendDisclosure.onOpen();
  };

  const onSwitchTab = (index: number) => {
    setSelectedDirection(index);
  };

  const onArrowClick = () => {
    router.push(`/city/${citySlug}/bus`);
  };

  const onHomeClick = () => {
    router.push('/');
  };

  const handleRouteStopClick = async (step: 1 | -1) => {
    const currentStops = selectedBusRoute.Stops;

    const previousStop =
      currentStops[
        currentStops.findIndex((stop) => stop.StopUID === selectedStopId) + step
      ];

    setSelectedStopId(previousStop.StopUID);

    const { getPosition } = await import('@/services/mapbox');
    mapContextRef.current.map.flyTo(
      getPosition(
        previousStop.StopPosition.PositionLat,
        previousStop.StopPosition.PositionLon,
        ZoomLevel.Stop,
      ),
    );
  };

  const onPreviousStopClick = async () => {
    await handleRouteStopClick(-1);
  };

  const onNextStopClick = async () => {
    await handleRouteStopClick(1);
  };

  useEffect(() => {
    if (isLoaded || router.isFallback) {
      return;
    }

    const handleInitialise = async () => {
      const { initialize, getPosition } = await import('@/services/mapbox');

      const middleStop = getMiddleElement(selectedBusRoute.Stops);

      mapContextRef.current.map = initialize(
        divRef.current,
        getPosition(
          middleStop.StopPosition.PositionLat,
          middleStop.StopPosition.PositionLon,
          ZoomLevel.City,
        ),
      );

      await new Promise<void>((res) => {
        mapContextRef.current.map.on('load', res);
      });
      setLoaded();
    };

    handleInitialise();
  }, [
    divRef,
    isLoaded,
    mapContextRef,
    router.isFallback,
    selectedBusRoute?.Stops,
    setLoaded,
  ]);

  useEffect(() => {
    if (!isLoaded || router.isFallback) {
      return;
    }

    const handleAttachStops = async () => {
      const { createJSXMarker, addLayerAndSource } = await import(
        '@/services/mapbox'
      );

      if (mapContextRef.current.markers.length > 0) {
        for (const marker of mapContextRef.current.markers) {
          marker.remove();
        }
      }

      mapContextRef.current.markers = selectedBusRoute.Stops.map((stop) =>
        createJSXMarker(
          <VStack
            spacing={0}
            cursor="pointer"
            onClick={async () => {
              const { getPosition } = await import('@/services/mapbox');
              mapContextRef.current.map.flyTo(
                getPosition(
                  stop.StopPosition.PositionLat,
                  stop.StopPosition.PositionLon,
                  ZoomLevel.Stops,
                ),
              );
            }}
          >
            <Circle
              borderWidth="1px"
              size="28px"
              borderColor="var(--chakra-colors-secondary-200)"
              bgColor="var(--chakra-colors-secondary-100)"
              color="var(--chakra-colors-secondary-800)"
            >
              {getTwoDigitString(stop.StopSequence)}
            </Circle>
            <Box
              h="12px"
              borderLeftWidth="2px"
              borderColor="var(--chakra-colors-secondary-200)"
            />
          </VStack>,
          [stop.StopPosition.PositionLon, stop.StopPosition.PositionLat],
          { offset: [0, -12] },
        ),
      );

      if (mapContextRef.current.map.getLayer(mapContextRef.current.layerId)) {
        mapContextRef.current.map.removeLayer(mapContextRef.current.layerId);
      }

      if (mapContextRef.current.map.getSource(mapContextRef.current.layerId)) {
        mapContextRef.current.map.removeSource(mapContextRef.current.layerId);
      }

      mapContextRef.current.layerId = addLayerAndSource(
        mapContextRef.current.map,
        route.RouteUID,
        geoJson,
        theme.colors.primary[200],
      );
    };

    handleAttachStops();
  }, [
    route?.RouteUID,
    geoJson,
    isLoaded,
    mapContextRef,
    router.isFallback,
    theme.colors.primary,
    selectedBusRoute?.Stops,
  ]);

  useEffect(() => {
    if (router.isFallback || !isLoaded || !mapContextRef.current.map) {
      return;
    }

    const { map } = mapContextRef.current;

    const handleZoom = () => {
      for (const marker of mapContextRef.current.markers) {
        marker.remove();
      }

      if (map.getZoom() >= ZoomLevel.Marker) {
        for (const marker of mapContextRef.current.markers) {
          marker.addTo(map);
        }
      }
    };

    map.on('zoomend', handleZoom);
    // eslint-disable-next-line consistent-return
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [isLoaded, mapContextRef, router.isFallback]);

  if (router.isFallback) {
    return null;
  }

  return (
    <>
      <NextHeadSeo title={`Iro Bus | ${routeName}-${CitySlugMap[citySlug]}`} />
      <Flex pos="relative" flexDir="column" h="full" color="white">
        <Flex p={4} bg="primary.800" justify="space-between" align="center">
          <IconButton
            display={MOBILE_DISPLAY}
            aria-label="back to previous page"
            variant="ghost"
            fontSize="4xl"
            onClick={onArrowClick}
            icon={<BiChevronLeft />}
          />
          <NavBarItems citySlug={citySlug} display={DESKTOP_DISPLAY} />
          <Stack
            direction={['row', 'column-reverse']}
            pos={['static', 'fixed']}
            spacing={[1, 4]}
            zIndex="overlay"
            right={[0, 4]}
            bottom={[0, 106]}
          >
            <IconButton
              aria-label="show more detail"
              variant={buttonVariant}
              fontSize="2xl"
              rounded="full"
              icon={<BsInfoCircle />}
              onClick={onOpen}
            />
            <IconButton
              aria-label="move back to home"
              variant={buttonVariant}
              fontSize="2xl"
              rounded="full"
              icon={<IoHome />}
              onClick={onHomeClick}
            />
          </Stack>
        </Flex>
        <Flex flexDir={['column', 'row-reverse']} flexGrow={1}>
          <Box flexGrow={1} overflowY="auto" />
          <Tabs
            w={['auto', DESKTOP_MAP_LEFT]}
            index={selectedDirection}
            onChange={onSwitchTab}
            zIndex="sticky"
            {...tabsProps}
          >
            <TabList
              sx={{
                pos: 'relative',
                p: 4,
                bg: 'primary.600',
                button: {
                  whiteSpace: 'noWrap',
                },
              }}
            >
              <IconButton
                display={MOBILE_DISPLAY}
                pos="absolute"
                top="0"
                left="30%"
                w="40%"
                aria-label="extend to top"
                h="4px"
                onClick={extendDisclosure.onToggle}
              />
              <Heading
                display={MOBILE_DISPLAY}
                as="h1"
                alignSelf="center"
                noOfLines={1}
              >
                {route.RouteName.Zh_tw}
              </Heading>
              <Box display={MOBILE_DISPLAY} flexGrow={1} />
              {directions.length > 1 ? (
                <>
                  <Tab>{route.DestinationStopNameZh}</Tab>
                  <Tab>{route.DepartureStopNameZh}</Tab>
                </>
              ) : (
                <Tab>
                  {routeStopEntity[directions[0]].Stops[0].StopName.Zh_tw}
                </Tab>
              )}
            </TabList>
            <TabPanels
              bg="secondary.900"
              maxW={DESKTOP_MAP_LEFT}
              h={[
                extendDisclosure.isOpen ? STOP_LIST_MAX_HEIGHT : 128,
                STOP_LIST_MAX_HEIGHT,
              ]}
              transition="ease-in-out"
              transitionDuration="0.35s"
              overflowX="hidden"
            >
              {directions.map((busDirection) => (
                <TabPanel key={busDirection} p="0">
                  {routeStopEntity[busDirection].Stops.map((stop) => (
                    <Flex
                      key={`${busDirection}-${stop.StopUID}-${stop.StopSequence}`}
                      align="center"
                      justify="space-between"
                      px="4"
                      cursor="pointer"
                      onClick={async () => {
                        if (!mapContextRef.current.map || !isLoaded) {
                          return;
                        }

                        const { getPosition } = await import(
                          '@/services/mapbox'
                        );

                        setSelectedStopId(stop.StopUID);
                        stopDisclosure.onOpen();
                        extendDisclosure.onClose();
                        mapContextRef.current.map.flyTo(
                          getPosition(
                            stop.StopPosition.PositionLat,
                            stop.StopPosition.PositionLon,
                            ZoomLevel.Stop,
                          ),
                        );
                      }}
                    >
                      <Text>
                        {/* TODO: add stop status util to better support different scenario */}
                        {data?.entities[stop.StopUID].StopStatus ===
                        BusStopStatus.正常
                          ? `${
                              data?.entities[stop.StopUID].EstimateTime
                                ? `${Math.floor(
                                    data?.entities[stop.StopUID].EstimateTime /
                                      60,
                                  )}分`
                                : '進站中'
                            }`
                          : '今日未營運'}{' '}
                        {stop.StopName.Zh_tw}
                      </Text>
                      <VStack spacing={0}>
                        <Box
                          h="20px"
                          borderLeft="2px"
                          borderColor="primary.200"
                        />
                        <Circle
                          size="20px"
                          fontSize="9px"
                          fontWeight="bold"
                          borderWidth="2px"
                          borderColor="primary.200"
                          rounded="full"
                        >
                          {getTwoDigitString(stop.StopSequence)}
                        </Circle>
                        <Box
                          h="20px"
                          borderLeft="2px"
                          borderColor="primary.200"
                        />
                      </VStack>
                    </Flex>
                  ))}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </Flex>
      </Flex>
      <BusRouteInfoModal isOpen={isOpen} onClose={onClose} route={route} />
      {selectedStop && (
        <Drawer
          isOpen={stopDisclosure.isOpen}
          onClose={onDrawerClose}
          size="lg"
          closeOnOverlayClick={false}
          placement="bottom"
        >
          <DrawerContent minH="200px" textAlign="center">
            <Box
              pos="fixed"
              w="full"
              h="full"
              overflow="hidden"
              bg="gradient.bg"
              zIndex="1"
            >
              <Image
                alt="background"
                src={background}
                placeholder="blur"
                layout="fill"
                objectFit="cover"
                objectPosition="bottom"
              />
            </Box>
            <DrawerHeader pb="0" zIndex="docked" noOfLines={1}>
              {selectedStop.StopName.Zh_tw}
            </DrawerHeader>
            <IconButton
              pos="absolute"
              right="4"
              top="5"
              rounded="full"
              size="xs"
              color="primary.600"
              bgColor="primary.50"
              aria-label="close modal"
              fontSize="xl"
              zIndex="docked"
              icon={<MdClose />}
              onClick={onDrawerClose}
            />
            <DrawerBody display="flex" flexDir="column" pt="0" zIndex="docked">
              <Text noOfLines={1} color="primary.200">
                往
                {selectedStop.Direction === BusDirection.去程
                  ? route.DestinationStopNameZh
                  : route.DepartureStopNameZh}
              </Text>
              <HStack mx="auto" my="2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<BiChevronLeft />}
                  isDisabled={
                    selectedBusRoute.Stops[0].StopUID === selectedStopId
                  }
                  onClick={onPreviousStopClick}
                >
                  上一站
                </Button>
                <Text minW="40px">
                  {/* TODO: add stop status util to better support different scenario */}
                  {selectedStop?.StopStatus === BusStopStatus.正常
                    ? `${
                        selectedStop?.EstimateTime
                          ? `${Math.floor(selectedStop?.EstimateTime / 60)}分`
                          : '進站中'
                      }`
                    : '今日未營運'}{' '}
                </Text>
                <Button
                  variant="ghost"
                  rightIcon={<BiChevronRight />}
                  size="sm"
                  isDisabled={
                    getLastElement(selectedBusRoute.Stops).StopUID ===
                    selectedStopId
                  }
                  onClick={onNextStopClick}
                >
                  下一站
                </Button>
              </HStack>
              <Box pos="absolute" bottom="1" left="0" right="0">
                <Image
                  src={bus}
                  placeholder="blur"
                  width={200}
                  height={60}
                  objectFit="contain"
                />
              </Box>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult => ({
  fallback: true,
  paths: [],
});

export const getStaticProps = async (
  context: GetStaticPropsContext,
): Promise<GetStaticPropsResult<BusRoutePageProps>> => {
  const { routeName } = context.params;
  const citySlug = context.params.citySlug as CitySlug;

  if (
    typeof routeName !== 'string' ||
    typeof citySlug !== 'string' ||
    !CITIES.includes(CitySlugMap[citySlug])
  ) {
    return {
      notFound: true,
    };
  }

  const route = await getBusRouteDetailByCityAndRouteName(
    routeName,
    CitySlugMap[citySlug],
  );

  if (!route) {
    return {
      redirect: {
        destination: `/city/${citySlug}`,
        permanent: false,
      },
    };
  }

  const routeShape = await getBusRouteShapeByCityAndRouteName(
    routeName,
    CitySlugMap[citySlug],
  );

  if (!routeShape) {
    return {
      redirect: {
        destination: `/city/${citySlug}`,
        permanent: false,
      },
    };
  }

  const routeStops = await getRouteStopsByCityAndRouteName(
    routeName,
    CitySlugMap[citySlug],
  );

  const directions: BusDirection[] = [];
  const routeStopEntity = {} as RouteStopEntity;

  for (const routeStop of routeStops) {
    // TODO: might have routes that have multiple directions
    if (!directions.includes(routeStop.Direction)) {
      directions.push(routeStop.Direction);
      routeStopEntity[routeStop.Direction] = routeStop;
    }
  }

  return {
    props: {
      citySlug,
      routeName,
      route,
      geoJson: parse(routeShape.Geometry) as GeoJSONLineString,
      directions,
      routeStopEntity,
    },
  };
};

BusRoutePage.layoutProps = {
  showMap: true,
};

export default BusRoutePage;
