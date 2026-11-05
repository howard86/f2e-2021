import {
  Box,
  Dialog,
  Flex,
  Icon,
  IconButton,
  Portal,
  useBreakpointValue,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { useAppToast } from '@f2e/ui/toast';
import type mapboxgl from 'mapbox-gl';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { BiMinus, BiPlus } from 'react-icons/bi';
import { IoLocate } from 'react-icons/io5';
import { MdClose, MdOutlinePlace } from 'react-icons/md';
import BikeIcon from '@/components/icons/bike-icon';
import DockIcon from '@/components/icons/dock-icon';
import background from '@/map.jpg';
import { useLazyGetStationsByCoordinateQuery } from '@/services/local';
import type { Coordinate } from '@/services/mapbox';
import { useMap } from './map-context-provider';

const DEFAULT_ZOOM = 15;

interface StationModalProps {
  address: string;
  name: string;
  rentNumber: number;
  returnNumber: number;
}

const MapView = () => {
  const toast = useAppToast();
  const searchRadius = useBreakpointValue({ base: 500, lg: 1000, md: 700 });
  const { mapRef, markersRef, positionMarkerRef, stationIdSetRef } = useMap();
  const currentPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  // TODO: refactor with useReducer
  const [modalProps, setModalProps] = useState<StationModalProps>({
    address: '',
    name: '',
    rentNumber: 0,
    returnNumber: 0,
  });
  const divRef = useRef<HTMLDivElement>(null);
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const [getStations, { isFetching }] = useLazyGetStationsByCoordinateQuery();

  const [loaded, setLoaded] = useState(false);

  const loadStationMarker = async () => {
    if (!currentPositionRef.current) {
      return;
    }

    const { attachJSXMarker } = await import('@/services/mapbox');

    const result = await getStations({
      ...currentPositionRef.current,
      r: searchRadius,
    }).unwrap();

    if (result.data.uids.length === 0) {
      toast({ description: '此地區不提供 YouBike 服務！', status: 'warning' });
      return;
    }

    toast({
      description: `方圓${searchRadius}公尺內，共有${result.data.uids.length}個 YouBike 站`,
    });

    for (const uid of result.data.uids) {
      const station = result.data.entities[uid];

      if (!stationIdSetRef.current.has(station.StationUID)) {
        stationIdSetRef.current.add(station.StationUID);
      }

      if (markersRef.current[station.StationUID]) {
        markersRef.current[station.StationUID].remove();
      }

      const coordinate = [
        station.StationPosition.PositionLon,
        station.StationPosition.PositionLat,
      ] as Coordinate;

      markersRef.current[station.StationUID] = attachJSXMarker(
        mapRef.current,
        <Box
          bgImage="url(/icons/marker.png)"
          cursor="pointer"
          h="82px"
          id={station.StationUID}
          mb="41px"
          // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
          onClick={() => {
            setModalProps({
              address: station.StationAddress.Zh_tw,
              name: station.StationName.Zh_tw,
              rentNumber: station.AvailableRentBikes,
              returnNumber: station.AvailableReturnBikes,
            });
            onOpen();
            mapRef.current.flyTo({
              center: coordinate,
              zoom: DEFAULT_ZOOM,
            });
          }}
          w="80px"
          zIndex="modal"
        />,
        coordinate,
      );
    }
  };

  const onLocate = async () => {
    if (currentPositionRef.current) {
      await loadStationMarker();
      return;
    }

    if (!window.navigator) {
      toast({ description: '偵測定位系統失敗', status: 'error' });
      return;
    }

    try {
      const geoLocation = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          window.navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
          });
        },
      );

      toast({ description: '成功獲取定位' });

      console.warn(geoLocation);

      const newPosition = {
        center: [
          geoLocation.coords.longitude,
          geoLocation.coords.latitude,
        ] as mapboxgl.LngLatLike,
        zoom: DEFAULT_ZOOM,
      };

      const flyToCurrent = () => {
        mapRef.current.flyTo({
          center: newPosition.center,
          zoom: DEFAULT_ZOOM,
        });
      };

      currentPositionRef.current = {
        lat: geoLocation.coords.latitude,
        lng: geoLocation.coords.longitude,
      };

      const { initialize, attachJSXMarker } = await import('@/services/mapbox');

      if (mapRef.current && positionMarkerRef.current) {
        flyToCurrent();
        positionMarkerRef.current.remove();
      } else {
        mapRef.current = initialize(divRef.current, newPosition);
      }

      positionMarkerRef.current = attachJSXMarker(
        mapRef.current,
        <Box
          bgImage="url(/icons/current.png)"
          h="40px"
          id="current"
          onClick={flyToCurrent}
          w="40px"
          zIndex="modal"
        />,
        newPosition.center,
      );

      await loadStationMarker();

      setLoaded(true);
    } catch (error) {
      const { code } = error as GeolocationPositionError;
      console.error(error);

      let description: string;
      switch (code) {
        case GeolocationPositionError.PERMISSION_DENIED:
          description = '授權定位失敗';
          break;

        case GeolocationPositionError.POSITION_UNAVAILABLE:
          description = '該地區無定位服務';
          break;

        case GeolocationPositionError.TIMEOUT:
          description = '獲取地址過久，連線中斷';
          break;

        default:
          description = '未知錯誤';
          break;
      }
      toast({ description, status: 'error' });
    }
  };

  const onZoomIn = () => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.zoomIn();
  };

  const onZoomOut = () => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.zoomOut();
  };

  useEffect(() => {
    if (!(loaded && mapRef.current)) {
      return;
    }

    const handleMapLoad = () => {
      mapRef.current.resize();
    };

    const handleMapMove = () => {
      const center = mapRef.current.getCenter();
      currentPositionRef.current = {
        lat: center.lat,
        lng: center.lng,
      };
    };

    mapRef.current.on('render', handleMapLoad);
    mapRef.current.on('move', handleMapMove);

    // eslint-disable-next-line consistent-return
    return () => {
      mapRef.current.off('render', handleMapLoad);
      mapRef.current.off('move', handleMapMove);
    };
  }, [loaded, mapRef]);

  return (
    <>
      <Box h="calc(100vh - 128px)" maxW="fill-available">
        <Box
          bottom="0"
          left="0"
          pos="absolute"
          ref={divRef}
          right="0"
          top="0"
          zIndex="1"
        />
        <Box h="full" overflow="hidden" pos="fixed" top="0" w="full">
          <Image
            alt="背景"
            fill
            sizes="100vw"
            src={background}
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        </Box>
        <VStack
          css={{
            '& button': {
              _hover: {
                bg: 'blackAlpha.600',
                boxSize: '64px',
                fontSize: '40px',
              },
              bg: 'blackAlpha.700',
              boxSize: '48px',
              display: 'inline-flex',
              fontSize: '24px',
              rounded: 'full',
              transition: 'all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)',
            },
            bottom: 0,
            left: 0,
            m: 8,
            pos: 'absolute',
            zIndex: 11,
          }}
          gap={4}
        >
          <IconButton
            aria-label="放大"
            color={isFetching ? 'gray.500' : 'white'}
            onClick={onZoomIn}
          >
            <BiPlus />
          </IconButton>
          <IconButton
            aria-label="縮小"
            color={isFetching ? 'gray.500' : 'white'}
            onClick={onZoomOut}
          >
            <BiMinus />
          </IconButton>
        </VStack>
        <Box
          css={{
            '& button': {
              _after: {
                boxShadow: '0 0 10px var(--chakra-colors-secondary-main)',
                content: '""',
                h: 'full',
                left: 0,
                position: 'absolute',
                rounded: 'full',
                top: 0,
                transition: 'all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)',
                w: 'full',
              },
              _focus: {
                _after: {
                  boxShadow: '0 0 20px var(--chakra-colors-secondary-main)',
                },
                bg: 'primary.dark',
              },
              _hover: {
                _after: {
                  boxShadow: '0 0 20px var(--chakra-colors-secondary-main)',
                },
                bg: 'primary.main',
              },
              bg: 'primary.main',
              boxSize: '100px',
              display: 'inline-flex',
              fontSize: '72px',
              rounded: 'full',
            },
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            left: 0,
            m: 8,
            pos: 'absolute',
            right: 0,
            zIndex: 'docked',
          }}
        >
          <IconButton
            aria-label="定位"
            color={isFetching ? 'gray.500' : 'white'}
            loading={isFetching}
            onClick={onLocate}
          >
            <IoLocate />
          </IconButton>
        </Box>
      </Box>

      <Dialog.Root
        // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
        onOpenChange={({ open }) => {
          if (!open) {
            onClose();
          }
        }}
        open={isOpen}
        scrollBehavior="inside"
        size="sm"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content color="black" mt="auto" rounded="3xl">
              <Dialog.Header maxW="95%" pb="2">
                <Dialog.Title>{modalProps.name}</Dialog.Title>
              </Dialog.Header>
              <Dialog.CloseTrigger asChild>
                <IconButton
                  aria-label="關閉站點資訊"
                  pos="absolute"
                  right="2"
                  top="2"
                  variant="ghost"
                >
                  <MdClose />
                </IconButton>
              </Dialog.CloseTrigger>
              <Dialog.Body fontSize="lg" mb="4">
                <Flex
                  css={{
                    '& > div': { alignItems: 'center', w: '50%' },
                  }}
                  mb="4"
                >
                  <Flex>
                    <BikeIcon color="secondary.main" fontSize="2xl" mr="2" />
                    可租借：{modalProps.rentNumber}台
                  </Flex>
                  <Flex>
                    <DockIcon color="secondary.main" fontSize="2xl" mr="2" />
                    可歸還：{modalProps.returnNumber}台
                  </Flex>
                </Flex>
                <Flex>
                  <Icon color="secondary.main" fontSize="2xl" mr="2">
                    <MdOutlinePlace />
                  </Icon>
                  {modalProps.address}
                </Flex>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default MapView;
