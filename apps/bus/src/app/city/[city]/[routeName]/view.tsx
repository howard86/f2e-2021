'use client';

import {
  Box,
  Flex,
  Heading,
  IconButton,
  type IconButtonProps,
  Stack,
  Tabs,
  Text,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import { BusDirection } from '@f2e/tdx-bus';
import type { City } from '@f2e/tdx-core';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BiChevronLeft } from 'react-icons/bi';
import { BsInfoCircle } from 'react-icons/bs';
import { IoHome } from 'react-icons/io5';
import type { GeoJSONLineString } from 'wellknown';

import BusRouteInfoModal from '@/components/bus-route-info-modal';
import BusStopDrawer, { ZoomLevel } from '@/components/bus-stop-drawer';
import { DESKTOP_MAP_LEFT } from '@/components/layout';
import { useMap } from '@/components/map-context-provider';
import NavBarItems from '@/components/nav-bar-items';
import StopRow from '@/components/stop-row';
import { DESKTOP_DISPLAY, MOBILE_DISPLAY } from '@/constants/style';
import { THIRTY_SEC_IN_MS } from '@/constants/time';
import useInView from '@/hooks/use-in-view';
import { useGetBusEstimation } from '@/services/local';
import theme from '@/theme';
import { getMiddleElement } from '@/utils/array';
import { getBusEstimationStatus } from '@/utils/bus';
import {
  getDirectionDestination,
  getDirectionTabName,
  type RouteStopEntity,
} from '@/utils/route-stops';
import type { SlimRouteStopEntity, SlimStop } from '@/utils/slim-route';
import { getTwoDigitString } from '@/utils/string';

interface BusRouteViewProps {
  busStopEntity: SlimRouteStopEntity;
  city: City;
  directions: BusDirection[];
  geoJson: GeoJSONLineString;
  routeName: string;
  routeUid: string;
}

const INITIAL_ID = '';
const STOP_LIST_MAX_HEIGHT = 'calc(100vh - 144px)';

const BusRouteView = ({
  city,
  routeName,
  routeUid: routeId,
  geoJson,
  directions,
  busStopEntity,
}: BusRouteViewProps) => {
  // the helpers and drawer only read Stops, which the slim entity carries
  const routeStopEntity = busStopEntity as RouteStopEntity;
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
  // TODO: refactor with useReducer
  const extendDisclosure = useDisclosure();
  const { open: isOpen, onClose, onOpen } = useDisclosure();
  const stopDisclosure = useDisclosure();
  const { inView: isStopListInView, ref: stopListRef } =
    useInView<HTMLDivElement>();
  const { data } = useGetBusEstimation(
    { city, route: routeName },
    THIRTY_SEC_IN_MS,
    isStopListInView || stopDisclosure.open,
  );
  const busEstimations = useMemo(
    () =>
      new Map(
        data?.data.map((busEstimation) => [
          busEstimation.StopUID,
          busEstimation,
        ]),
      ),
    [data],
  );
  const selectedBusEstimation = busEstimations.get(selectedStopId);

  // as bus direction might only be 迴圈
  const selectedBusRoute =
    // biome-ignore lint/suspicious/noUnnecessaryConditions: TDX can omit direction data at runtime.
    routeStopEntity?.[selectedDirection] || routeStopEntity?.[directions[0]];

  const onDrawerClose = () => {
    stopDisclosure.onClose();
    extendDisclosure.onOpen();
  };

  const { onOpen: openStopDrawer } = stopDisclosure;
  const { onClose: closeExtend } = extendDisclosure;

  const onSelectStop = useCallback(
    async (stop: SlimStop) => {
      if (!(mapContextRef.current.map && isLoaded)) {
        return;
      }

      const { getPosition } = await import('@/services/mapbox');

      setSelectedStopId(stop.StopUID);
      openStopDrawer();
      closeExtend();
      mapContextRef.current.map.flyTo(
        getPosition(
          stop.StopPosition.PositionLat,
          stop.StopPosition.PositionLon,
          ZoomLevel.Stop,
        ),
      );
    },
    [closeExtend, isLoaded, mapContextRef, openStopDrawer],
  );

  const onSwitchTab = (value: string) => {
    setSelectedDirection(Number(value) as BusDirection);
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
      const { createMarker, createMarkerElement, addLayerAndSource } =
        await import('@/services/mapbox');

      if (mapContextRef.current.markers.length > 0) {
        for (const marker of mapContextRef.current.markers) {
          marker.remove();
        }
      }

      mapContextRef.current.markers = selectedBusRoute.Stops.map((stop) => {
        const element = createMarkerElement({
          onClick: async () => {
            const { getPosition } = await import('@/services/mapbox');
            mapContextRef.current.map.flyTo(
              getPosition(
                stop.StopPosition.PositionLat,
                stop.StopPosition.PositionLon,
                ZoomLevel.Stops,
              ),
            );
          },
          style: {
            alignItems: 'center',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
          },
        });

        element.append(
          createMarkerElement({
            style: {
              alignItems: 'center',
              backgroundColor: 'var(--chakra-colors-secondary-100)',
              borderColor: 'var(--chakra-colors-secondary-200)',
              borderRadius: '9999px',
              borderStyle: 'solid',
              borderWidth: '1px',
              color: 'var(--chakra-colors-secondary-800)',
              display: 'flex',
              flexShrink: '0',
              height: '28px',
              justifyContent: 'center',
              width: '28px',
            },
            text: getTwoDigitString(stop.StopSequence),
          }),
          createMarkerElement({
            style: {
              borderColor: 'var(--chakra-colors-secondary-200)',
              borderLeftStyle: 'solid',
              borderLeftWidth: '2px',
              height: '12px',
            },
          }),
        );

        return createMarker(
          element,
          [stop.StopPosition.PositionLon, stop.StopPosition.PositionLat],
          { offset: [0, -12] },
        );
      });

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

    let syncedMarkers: typeof mapContextRef.current.markers | null = null;
    let isVisible = false;

    const handleZoom = () => {
      const { markers } = mapContextRef.current;

      // freshly attached markers are not on the map yet
      if (markers !== syncedMarkers) {
        syncedMarkers = markers;
        isVisible = false;
      }

      const shouldShow = map.getZoom() >= ZoomLevel.Marker;

      if (shouldShow === isVisible) {
        return;
      }

      for (const marker of markers) {
        if (shouldShow) {
          marker.addTo(map);
        } else {
          marker.remove();
        }
      }

      isVisible = shouldShow;
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
            lazyMount
            // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
            onValueChange={({ value }) => onSwitchTab(value)}
            unmountOnExit
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
                w: 'full',
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
                flexShrink={0}
                lineClamp={1}
              >
                {routeName}
              </Heading>
              <Box display={MOBILE_DISPLAY} flexGrow={1} />
              {directions.map((direction) => (
                <Tabs.Trigger
                  flex="1"
                  key={direction}
                  minW="0"
                  value={String(direction)}
                >
                  {/* Stop names can be long; truncate rather than overflow on phones. */}
                  <Text truncate>
                    {getDirectionTabName(
                      routeStopEntity,
                      directions,
                      direction,
                    )}
                  </Text>
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
              ref={stopListRef}
              transition="ease-in-out"
              transitionDuration="0.35s"
            >
              {directions.map((busDirection) => (
                <Tabs.Content
                  key={busDirection}
                  p="0"
                  value={String(busDirection)}
                >
                  {routeStopEntity[busDirection].Stops.map((stop) => (
                    <StopRow
                      key={`${busDirection}-${stop.StopUID}-${stop.StopSequence}`}
                      onSelect={onSelectStop}
                      status={getBusEstimationStatus(
                        busEstimations.get(stop.StopUID),
                      )}
                      stop={stop}
                    />
                  ))}
                </Tabs.Content>
              ))}
            </Box>
          </Tabs.Root>
        </Flex>
      </Flex>
      <BusRouteInfoModal
        city={city}
        isOpen={isOpen}
        onClose={onClose}
        routeName={routeName}
        routeUid={routeId}
      />
      {Boolean(selectedBusEstimation) && (
        <BusStopDrawer
          busEstimation={selectedBusEstimation}
          destinationName={getDirectionDestination(
            routeStopEntity,
            selectedBusEstimation.Direction as BusDirection,
          )}
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
