import { Badge, HStack, Stack, Text } from '@chakra-ui/react';

import { getNearestStations } from '@/services/transports';
import type { PlaceDetail } from '@/types/place';
import type { StationKind } from '@/types/transport';

const KIND_LABEL: Record<StationKind, string> = {
  Bike: 'YouBike',
  Metro: '捷運',
  THSR: '高鐵',
  TRA: '台鐵',
};

const formatDistance = (km: number) => {
  const metres = Math.round(km * 100) * 10;

  return metres < 1000 ? `${metres} 公尺` : `${km.toFixed(1)} 公里`;
};

const NearestStations = async ({ detail }: { detail: PlaceDetail }) => {
  if (!detail.position) {
    return null;
  }

  const stations = await getNearestStations(detail.position, detail.citySlug);

  if (stations.length === 0) {
    return null;
  }

  return (
    <Stack as="section" gap="3">
      <Text fontWeight="semibold" textStyle="title-sm">
        最近車站
      </Text>
      <Stack as="ul" gap="2" listStyle="none">
        {stations.map((station) => (
          <HStack as="li" gap="3" key={`${station.kind}-${station.id}`}>
            <Badge colorPalette="gray" variant="subtle">
              {KIND_LABEL[station.kind]}
            </Badge>
            <Text flex="1" minW="0" textStyle="body-sm">
              {station.name}
              <Text as="span" color="fg.muted">
                {' '}
                · {station.operator}
              </Text>
            </Text>
            <Text color="fg.muted" flexShrink={0} textStyle="body-sm">
              {formatDistance(station.distanceKm)}
            </Text>
          </HStack>
        ))}
      </Stack>
    </Stack>
  );
};

export default NearestStations;
