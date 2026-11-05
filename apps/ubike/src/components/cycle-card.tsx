import { Box, Flex, Heading, HStack, Portal, Tooltip } from '@chakra-ui/react';
import { type City, CityMap } from '@f2e/tdx-core';
import { useAppToast } from '@f2e/ui/toast';
import { m, type Variants } from 'framer-motion';
import type { GeoJSONMultiLineString } from 'wellknown';
import type { Coordinate } from '@/services/mapbox';
import { getDifficulty } from '@/services/utils';
import system from '@/theme';
import DistanceIcon from './icons/distance-icon';
import PlaceIcon from './icons/place-icon';
import StarIcon from './icons/star-icon';
import { useMap } from './map-context-provider';
import RouteMarker from './route-marker';

interface CycleCardProps {
  city: City;
  geoJson: GeoJSONMultiLineString;
  length?: number;
  name: string;
  onToggle: VoidFunction;
}

const MotionBox = m.create(Box);
const DIFFICULTY_STARS = ['easy', 'medium', 'hard', 'expert'] as const;

const variants: Variants = {
  hidden: { opacity: 0, translateY: 20 },
  show: { opacity: 1, translateY: 0 },
};

const CycleCard = ({
  name,
  city,
  length,
  onToggle,
  geoJson,
}: CycleCardProps) => {
  const toast = useAppToast();
  const { mapRef, layerIdRef, markersRef, stationIdSetRef } = useMap();

  const onClick = async () => {
    if (!mapRef.current) {
      toast({
        description: '麻煩請先打開定位',
        status: 'info',
      });
      onToggle();
      return;
    }

    const { addLayerAndSource, attachJSXMarker } = await import(
      '@/services/mapbox'
    );

    if (mapRef.current.getLayer(layerIdRef.current)) {
      mapRef.current.removeLayer(layerIdRef.current);
    }

    if (mapRef.current.getSource(layerIdRef.current)) {
      mapRef.current.removeSource(layerIdRef.current);
    }

    stationIdSetRef.current.clear();
    for (const existedStationId of Object.keys(markersRef.current)) {
      markersRef.current[existedStationId].remove();
    }
    markersRef.current = {};

    layerIdRef.current = addLayerAndSource(
      mapRef.current,
      name,
      geoJson,
      system.token('colors.primary.main'),
    );
    const coordinates = geoJson.coordinates[0] as Coordinate[];

    markersRef.current[coordinates[0].toString()] = attachJSXMarker(
      mapRef.current,
      <RouteMarker>起點</RouteMarker>,
      coordinates[0],
    );

    markersRef.current[coordinates.at(-1).toString()] = attachJSXMarker(
      mapRef.current,
      <RouteMarker>終點</RouteMarker>,
      coordinates.at(-1),
    );

    onToggle();
  };

  return (
    <MotionBox
      _hover={{
        bg: 'whiteAlpha.900',
      }}
      bg="white"
      color="blackAlpha.800"
      cursor="pointer"
      onClick={onClick}
      p={[4, 6]}
      rounded="xl"
      variants={variants}
    >
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Heading fontSize="lg" lineClamp={1} mb="2">
            {name}
          </Heading>
        </Tooltip.Trigger>
        <Portal>
          <Tooltip.Positioner>
            <Tooltip.Content>{name}</Tooltip.Content>
          </Tooltip.Positioner>
        </Portal>
      </Tooltip.Root>
      <Flex
        css={{
          '& > div': { alignItems: 'center', w: '50%' },
        }}
        fontSize="sm"
        mb="4"
      >
        <Flex>
          <DistanceIcon fontSize="2xl" mr="1" />
          {length ? (length / 1000).toFixed(1) : '-'}
          KM
        </Flex>
        <Flex>
          <PlaceIcon color="secondary.main" fontSize="2xl" mr="1" />
          {CityMap[city]}
        </Flex>
      </Flex>
      <HStack>
        {DIFFICULTY_STARS.slice(0, getDifficulty(length)).map((star) => (
          <StarIcon color="primary.main" key={`${name}-${star}`} />
        ))}
      </HStack>
    </MotionBox>
  );
};

export default CycleCard;
