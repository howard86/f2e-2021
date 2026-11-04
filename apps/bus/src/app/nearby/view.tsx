'use client';

import {
  Accordion,
  Box,
  Button,
  Center,
  Circle,
  Flex,
  IconButton,
  type IconButtonProps,
  useBreakpointValue,
  Wrap,
} from '@chakra-ui/react';
import { CityMap } from '@f2e/tdx';
import { useRouter } from 'next/navigation';
import { IoHome } from 'react-icons/io5';

import { ZoomLevel } from '@/components/bus-stop-drawer';
import { DESKTOP_MAP_LEFT, MOBILE_MAP_BOTTOM } from '@/components/layout';
import { useMap } from '@/components/map-context-provider';
import NavBarItems from '@/components/nav-bar-items';
import RouteLink from '@/components/route-link';
import { DESKTOP_DISPLAY } from '@/constants/style';
import useAppToast from '@/hooks/use-app-toast';
import useGetLocation from '@/hooks/use-get-location';
import { useGetNearByBusMutation } from '@/services/local';

const NearByView = () => {
  const toast = useAppToast();
  const { currentPositionRef, onLocate } = useGetLocation();
  const router = useRouter();
  const buttonVariant = useBreakpointValue<IconButtonProps['variant']>({
    base: 'ghost',
    md: 'solid',
  });
  const { divRef, mapContextRef, isLoaded, setLoaded } = useMap();
  const [getBusStations, { isSuccess, data }] = useGetNearByBusMutation();

  const onHomeClick = () => {
    router.push('/');
  };

  const onSearch = async () => {
    await onLocate();

    if (currentPositionRef === null) {
      return;
    }

    if (!isLoaded) {
      const { initialize } = await import('@/services/mapbox');
      mapContextRef.current.map = initialize(divRef.current, {
        center: [
          currentPositionRef.current.lng,
          currentPositionRef.current.lat,
        ],
        zoom: ZoomLevel.Stops,
      });

      await mapContextRef.current.map.once('load');

      setLoaded();
    }

    try {
      const response = await getBusStations(
        currentPositionRef.current,
      ).unwrap();

      toast({ description: `共查詢到${response.data.length}站` });
    } catch {
      toast({ description: '搜尋失敗', status: 'error' });
    }
  };

  return (
    <Flex color="white" flexDir="column" h="full" pos="relative">
      <Flex align="center" bg="primary.800" justify="space-between" p={4}>
        <NavBarItems display={DESKTOP_DISPLAY} />
        <IconButton
          aria-label="move back to home"
          bottom={[0, 106]}
          fontSize="2xl"
          onClick={onHomeClick}
          pos={['static', 'fixed']}
          right={[0, 4]}
          rounded="full"
          variant={buttonVariant}
          zIndex="overlay"
        >
          <IoHome />
        </IconButton>
      </Flex>
      <Flex flexDir={['column', 'row-reverse']} flexGrow={1} overflowY="auto">
        <Center flexGrow={1}>
          <Button
            display={isSuccess ? 'none' : 'block'}
            onClick={onSearch}
            variant="outline"
            zIndex="overlay"
          >
            搜尋
          </Button>
        </Center>
        <Accordion.Root
          bgGradient="background"
          collapsible
          h={[MOBILE_MAP_BOTTOM, 'auto']}
          maxW={DESKTOP_MAP_LEFT}
          overflowY="auto"
          w={['auto', DESKTOP_MAP_LEFT]}
        >
          {data?.data.map((busStation) => (
            <Accordion.Item
              key={busStation.StationUID}
              value={busStation.StationUID}
            >
              <Accordion.ItemTrigger
                // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
                onFocus={async () => {
                  const { createJSXMarker } = await import('@/services/mapbox');
                  const marker = createJSXMarker(
                    <Circle
                      bgColor="var(--chakra-colors-secondary-200)"
                      size="12px"
                    />,
                    [
                      busStation.StationPosition.PositionLon,
                      busStation.StationPosition.PositionLat,
                    ],
                  );

                  marker.addTo(mapContextRef.current.map);
                  mapContextRef.current.markers.push(marker);
                }}
              >
                <Box flex="1" textAlign="left">
                  {busStation.StationName.Zh_tw}
                </Box>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody pb={4}>
                  <Wrap>
                    {busStation.Stops.map((stop) => (
                      <Button
                        asChild
                        key={`${busStation.StationUID}-${stop.StopUID}-${stop.RouteUID}`}
                        variant="outline"
                      >
                        <RouteLink
                          href={`/city/${
                            CityMap[busStation.LocationCityCode]
                          }/${stop.RouteName.Zh_tw}`}
                        >
                          {stop.RouteName.Zh_tw}
                        </RouteLink>
                      </Button>
                    ))}
                  </Wrap>
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </Flex>
    </Flex>
  );
};

export default NearByView;
