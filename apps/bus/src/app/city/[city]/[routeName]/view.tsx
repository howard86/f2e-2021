'use client';

import {
  Box,
  Circle,
  Flex,
  Heading,
  IconButton,
  type IconButtonProps,
  Stack,
  Tabs,
  Tag,
  Text,
  useBreakpointValue,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import {
  BusDirection,
  type BusRoute,
  type BusStopOfRoute,
  type City,
} from '@f2e/tdx';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BiChevronLeft } from 'react-icons/bi';
import { BsInfoCircle } from 'react-icons/bs';
import { IoHome } from 'react-icons/io5';
import type { GeoJSONLineString } from 'wellknown';

import BusRouteInfoModal from '@/components/bus-route-info-modal';
import BusStopDrawer, { ZoomLevel } from '@/components/bus-stop-drawer';
import { DESKTOP_MAP_LEFT } from '@/components/layout';
import { useMap } from '@/components/map-context-provider';
import NavBarItems from '@/components/nav-bar-items';
import { DESKTOP_DISPLAY, MOBILE_DISPLAY } from '@/constants/style';
import { THIRTY_SEC_IN_MS } from '@/constants/time';
import {
  busEstimationSelector,
  useGetBusEstimationQuery,
} from '@/services/local';
import theme from '@/theme';
import { getMiddleElement } from '@/utils/array';
import { getBusEstimationStatus } from '@/utils/bus';
import { getTwoDigitString } from '@/utils/string';

interface BusRouteViewProps {
  busRoute: BusRoute;
  busStopEntity: RouteStopEntity;
  city: City;
  directions: BusDirection[];
  geoJson: GeoJSONLineString;
  routeName: string;
}

export type RouteStopEntity = Record<BusDirection, BusStopOfRoute>;

const INITIAL_ID = '';
const STOP_LIST_MAX_HEIGHT = 'calc(100vh - 144px)';

const BusRouteView = ({
  city,
  routeName,
  busRoute: route,
  geoJson,
  directions,
  busStopEntity: routeStopEntity,
}: BusRouteViewProps) => {
  const router = useRouter();
  const tabsProps = useBreakpointValue<
    Omit<Tabs.RootProps, 'children' | 'onValueChange' | 'value'>
  >({
    base: { variant: 'subtle' },
    md: { fitted: true, variant: 'line' },
  });
  const buttonVariant = useBreakpointValue<IconButtonProps['variant']>({
    base: 'ghost',
    md: 'solid',
  });
  const [selectedDirection, setSelectedDirection] = useState<BusDirection>(
    directions[0] ?? BusDirection.去程,
  );
  const [selectedStopId, setSelectedStopId] = useState(INITIAL_ID);
  const { divRef, mapContextRef, isLoaded, setLoaded } = useMap();
  const routeId = (route as BusRoute | undefined)?.RouteUID;
  // TODO: refactor with useReducer
  const extendDisclosure = useDisclosure();
  const { open: isOpen, onClose, onOpen } = useDisclosure();
  const stopDisclosure = useDisclosure();
  const { data, selectedBusEstimation } = useGetBusEstimationQuery(
    { city, route: routeName },
    {
      pollingInterval: THIRTY_SEC_IN_MS,
      selectFromResult: (res) => ({
        ...res,
        selectedBusEstimation:
          res.data &&
          busEstimationSelector.selectById(res.data, selectedStopId),
      }),
    },
  );

  // as bus direction might only be 迴圈
  const selectedBusRoute =
    // biome-ignore lint/suspicious/noUnnecessaryConditions: TDX can omit direction data at runtime.
    routeStopEntity?.[selectedDirection] || routeStopEntity?.[directions[0]];

  const onDrawerClose = () => {
    stopDisclosure.onClose();
    extendDisclosure.onOpen();
  };

  const onSwitchTab = (value: string) => {
    setSelectedDirection(Number(value) as BusDirection);
  };

  const getDirectionName = (direction: BusDirection) => {
    if (directions.length === 1) {
      return routeStopEntity[direction].Stops[0].StopName.Zh_tw;
    }

    return direction === BusDirection.去程
      ? route.DestinationStopNameZh
      : route.DepartureStopNameZh;
  };

  const onArrowClick = () => {
    router.back();
  };

  const onHomeClick = () => {
    router.push('/');
  };

  useEffect(() => {
    if (isLoaded) {
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

      await mapContextRef.current.map.once('load');
      setLoaded();
    };

    handleInitialise();
  }, [divRef, isLoaded, mapContextRef, selectedBusRoute?.Stops, setLoaded]);

  useEffect(() => {
    if (!(isLoaded && routeId)) {
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
            cursor="pointer"
            gap={0}
            // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
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
              bgColor="var(--chakra-colors-secondary-100)"
              borderColor="var(--chakra-colors-secondary-200)"
              borderWidth="1px"
              color="var(--chakra-colors-secondary-800)"
              size="28px"
            >
              {getTwoDigitString(stop.StopSequence)}
            </Circle>
            <Box
              borderColor="var(--chakra-colors-secondary-200)"
              borderLeftWidth="2px"
              h="12px"
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
        routeId,
        geoJson,
        theme.token('colors.primary.200'),
      );
    };

    handleAttachStops();
  }, [routeId, geoJson, isLoaded, mapContextRef, selectedBusRoute?.Stops]);

  useEffect(() => {
    if (!(isLoaded && mapContextRef.current.map)) {
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
  }, [isLoaded, mapContextRef]);

  return (
    <>
      <Flex color="white" flexDir="column" h="full" pos="relative">
        <Flex align="center" bg="primary.800" justify="space-between" p={4}>
          <IconButton
            aria-label="back to previous page"
            display={MOBILE_DISPLAY}
            fontSize="4xl"
            onClick={onArrowClick}
            variant="ghost"
          >
            <BiChevronLeft />
          </IconButton>
          <NavBarItems display={DESKTOP_DISPLAY} />
          <Stack
            bottom={[0, '72px']}
            direction={['row', 'column-reverse']}
            gap={[1, 4]}
            pos={['static', 'fixed']}
            right={[0, 4]}
            zIndex="overlay"
          >
            <IconButton
              aria-label="show more detail"
              fontSize="2xl"
              onClick={onOpen}
              rounded="full"
              variant={buttonVariant}
            >
              <BsInfoCircle />
            </IconButton>
            <IconButton
              aria-label="move back to home"
              fontSize="2xl"
              onClick={onHomeClick}
              rounded="full"
              variant={buttonVariant}
            >
              <IoHome />
            </IconButton>
          </Stack>
        </Flex>
        <Flex flexDir={['column', 'row-reverse']} flexGrow={1}>
          <Box flexGrow={1} overflowY="auto" />
          <Tabs.Root
            // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
            onValueChange={({ value }) => onSwitchTab(value)}
            value={String(selectedDirection)}
            w={['auto', DESKTOP_MAP_LEFT]}
            zIndex="sticky"
            {...tabsProps}
          >
            <Tabs.List
              css={{
                '& button': {
                  whiteSpace: 'noWrap',
                },
                bg: 'primary.600',
                p: 4,
                pos: 'relative',
              }}
            >
              <IconButton
                aria-label="extend to top"
                display={MOBILE_DISPLAY}
                h="4px"
                left="30%"
                onClick={extendDisclosure.onToggle}
                pos="absolute"
                top="0"
                w="40%"
              />
              <Heading
                alignSelf="center"
                as="h1"
                display={MOBILE_DISPLAY}
                lineClamp={1}
              >
                {route.RouteName.Zh_tw}
              </Heading>
              <Box display={MOBILE_DISPLAY} flexGrow={1} />
              {directions.map((direction) => (
                <Tabs.Trigger key={direction} value={String(direction)}>
                  {getDirectionName(direction)}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <Box
              bg="secondary.900"
              h={[
                extendDisclosure.open ? STOP_LIST_MAX_HEIGHT : 128,
                STOP_LIST_MAX_HEIGHT,
              ]}
              maxW={DESKTOP_MAP_LEFT}
              overflowX="hidden"
              transition="ease-in-out"
              transitionDuration="0.35s"
            >
              {directions.map((busDirection) => (
                <Tabs.Content
                  key={busDirection}
                  p="0"
                  value={String(busDirection)}
                >
                  {routeStopEntity[busDirection].Stops.map((stop) => {
                    const status = getBusEstimationStatus(
                      data?.entities[stop.StopUID],
                    );

                    const isComing = status === '進站中';
                    return (
                      <Flex
                        align="center"
                        cursor="pointer"
                        key={`${busDirection}-${stop.StopUID}-${stop.StopSequence}`}
                        // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
                        onClick={async () => {
                          if (!(mapContextRef.current.map && isLoaded)) {
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
                        px="4"
                      >
                        <Text>{stop.StopName.Zh_tw}</Text>
                        <Tag.Root colorPalette="secondary" ml="2">
                          <Tag.Label>{status}</Tag.Label>
                        </Tag.Root>
                        <Box flexGrow={1} />
                        <VStack gap={0}>
                          <Box
                            borderColor="primary.200"
                            borderLeft="2px"
                            h="20px"
                          />
                          <Circle
                            bg={isComing ? 'primary.200' : 'transparent'}
                            borderColor="primary.200"
                            borderWidth="2px"
                            boxShadow={
                              isComing
                                ? '0 0 5px var(--chakra-colors-secondary-200),0 0 10px var(--chakra-colors-secondary-300),0 0 15px var(--chakra-colors-secondary-400)'
                                : 'none'
                            }
                            color={isComing ? 'secondary.700' : 'white'}
                            fontSize="9px"
                            fontWeight="bold"
                            rounded="full"
                            size="20px"
                          >
                            {getTwoDigitString(stop.StopSequence)}
                          </Circle>
                          <Box
                            borderColor="primary.200"
                            borderLeft="2px"
                            h="20px"
                          />
                        </VStack>
                      </Flex>
                    );
                  })}
                </Tabs.Content>
              ))}
            </Box>
          </Tabs.Root>
        </Flex>
      </Flex>
      <BusRouteInfoModal isOpen={isOpen} onClose={onClose} route={route} />
      {Boolean(selectedBusEstimation) && (
        <BusStopDrawer
          busEstimation={selectedBusEstimation}
          busRoute={route}
          isOpen={stopDisclosure.open}
          onClose={onDrawerClose}
          selectedBusStop={selectedBusRoute}
          selectedStopId={selectedStopId}
          setSelectedStopId={setSelectedStopId}
        />
      )}
    </>
  );
};

export default BusRouteView;
