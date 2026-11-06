import { Badge, Box, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { type City, CityMap } from '@f2e/tdx-core';
import { ExternalLink } from '@f2e/ui/links';

import { supportsBikeData } from '@/constants/transports';
import {
  getBikeSummary,
  getBusSummary,
  getMetroLines,
  getServiceNotices,
  getTraStations,
} from '@/services/transports';

import { TransportSection, Unavailable } from './section-state';

const BUS_APP = 'https://bus.howardism.dev';
const UBIKE_APP = 'https://ubike.howardism.dev';

const Stat = ({ label, value }: { label: string; value: string }) => (
  <Box bg="bg.subtle" borderColor="border" borderWidth="1px" p="4" rounded="lg">
    <Text color="fg.muted" textStyle="body-sm">
      {label}
    </Text>
    <Text textStyle="title-md">{value}</Text>
  </Box>
);

const noticeDate = (value?: string) => {
  const date = value ? new Date(value) : undefined;

  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat('zh-TW', {
        dateStyle: 'medium',
        timeZone: 'Asia/Taipei',
      }).format(date)
    : undefined;
};

export const BusSection = async ({ city }: { city: City }) => {
  const summary = await getBusSummary(city);

  return (
    <TransportSection
      action={{ href: `${BUS_APP}/city/${city}`, label: '公車動態' }}
      title="公車"
    >
      {summary ? (
        <Stack gap="4">
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="3">
            <Stat label="路線數" value={`${summary.routeCount} 條`} />
            <Stat label="營運業者" value={`${summary.operators.length} 家`} />
          </SimpleGrid>
          {summary.operators.length > 0 && (
            <HStack flexWrap="wrap" gap="2">
              {summary.operators.map((name) => (
                <Badge colorPalette="gray" key={name} variant="subtle">
                  {name}
                </Badge>
              ))}
            </HStack>
          )}
          {summary.routes.length > 0 && (
            <SimpleGrid columns={{ base: 1, lg: 3, md: 2 }} gap="3">
              {summary.routes.map((route) => (
                <ExternalLink
                  _hover={{ borderColor: 'colorPalette.solid' }}
                  borderColor="border"
                  borderWidth="1px"
                  href={route.href}
                  key={route.href}
                  px="4"
                  py="3"
                  rounded="lg"
                  textDecoration="none"
                >
                  <Text textStyle="title-sm">{route.name}</Text>
                  {route.headsign ? (
                    <Text color="fg.muted" textStyle="body-sm">
                      {route.headsign}
                    </Text>
                  ) : null}
                </ExternalLink>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      ) : (
        <Unavailable />
      )}
    </TransportSection>
  );
};

export const BikeSection = async ({ city }: { city: City }) => {
  // TDX has no bike data for these cities: not an outage, so show nothing.
  if (!supportsBikeData(city)) {
    return null;
  }

  const summary = await getBikeSummary(city);

  return (
    <TransportSection
      action={{ href: UBIKE_APP, label: 'YouBike 站點' }}
      title="自行車"
    >
      {summary ? (
        <Stack gap="4">
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="3">
            <Stat label="YouBike 站點" value={`${summary.stationCount} 站`} />
            {summary.cyclingKm > 0 && (
              <Stat label="自行車道" value={`${summary.cyclingKm} 公里`} />
            )}
          </SimpleGrid>
          {summary.systems.length > 0 && (
            <HStack flexWrap="wrap" gap="2">
              {summary.systems.map((name) => (
                <Badge colorPalette="gray" key={name} variant="subtle">
                  {name}
                </Badge>
              ))}
            </HStack>
          )}
        </Stack>
      ) : (
        <Unavailable />
      )}
    </TransportSection>
  );
};

export const MetroSection = async ({ city }: { city: City }) => {
  const lines = await getMetroLines(city);

  // Cities without a metro have nothing to show; a TDX failure looks the same
  // here, and the notices section below still reports the outage.
  if (lines.length === 0) {
    return null;
  }

  return (
    <TransportSection title="捷運">
      <SimpleGrid columns={{ base: 1, lg: 3, md: 2 }} gap="3">
        {lines.map((line) => (
          <HStack
            borderColor="border"
            borderWidth="1px"
            gap="3"
            key={`${line.systemName}-${line.lineId}`}
            px="4"
            py="3"
            rounded="lg"
          >
            <Box
              aria-hidden
              bg={line.color ?? 'gray.400'}
              flexShrink={0}
              h="8"
              rounded="full"
              w="2"
            />
            <Box>
              <Text textStyle="title-sm">{line.name}</Text>
              <Text color="fg.muted" textStyle="body-sm">
                {line.systemName} · {line.stationCount} 站
              </Text>
            </Box>
          </HStack>
        ))}
      </SimpleGrid>
    </TransportSection>
  );
};

export const TraSection = async ({ city }: { city: City }) => {
  const stations = await getTraStations(city);

  return (
    <TransportSection
      action={{ href: '/transports#thsr', label: '高鐵站與票價' }}
      title="台鐵車站"
    >
      {stations.length > 0 ? (
        <HStack flexWrap="wrap" gap="2">
          {stations.map((station) => (
            <Badge
              colorPalette="gray"
              key={station.id}
              size="lg"
              variant="subtle"
            >
              {station.name}
            </Badge>
          ))}
        </HStack>
      ) : (
        <Unavailable />
      )}
    </TransportSection>
  );
};

export const NoticesSection = async ({ city }: { city: City }) => {
  const notices = (await getServiceNotices(city)).slice(0, 8);

  return (
    <TransportSection title="服務公告">
      {notices.length > 0 ? (
        <Stack as="ul" gap="3" listStyle="none">
          {notices.map((notice) => {
            const date = noticeDate(notice.publishedAt);

            return (
              <Box
                as="li"
                borderColor="border"
                borderWidth="1px"
                key={notice.id}
                px="4"
                py="3"
                rounded="lg"
              >
                <HStack flexWrap="wrap" gap="2">
                  <Badge colorPalette="gray" variant="subtle">
                    {notice.source}
                  </Badge>
                  {date ? (
                    <Text color="fg.muted" textStyle="body-sm">
                      {date}
                    </Text>
                  ) : null}
                </HStack>
                {notice.url ? (
                  <ExternalLink
                    display="block"
                    href={notice.url}
                    mt="1"
                    textStyle="title-sm"
                  >
                    {notice.title}
                  </ExternalLink>
                ) : (
                  <Text mt="1" textStyle="title-sm">
                    {notice.title}
                  </Text>
                )}
              </Box>
            );
          })}
        </Stack>
      ) : (
        <Text color="fg.muted" textStyle="body-sm">
          {CityMap[city]}目前沒有服務公告，或暫時無法取得資料。
        </Text>
      )}
    </TransportSection>
  );
};
