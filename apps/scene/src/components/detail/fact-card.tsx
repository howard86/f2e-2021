import { Box, Button, Grid, Icon, Link, Stack, Text } from '@chakra-ui/react';
import { ExternalLink } from '@f2e/ui/links';
import type { IconType } from 'react-icons';
import {
  FiClock,
  FiDollarSign,
  FiExternalLink,
  FiGlobe,
  FiInfo,
  FiMapPin,
  FiNavigation,
  FiPhone,
  FiTruck,
} from 'react-icons/fi';

import type { PlaceDetail, PlaceFact } from '@/types/place';

import CalendarButton from './calendar-button';
import { directionsUrl, mapSearchUrl } from './helpers';
import MapEmbed from './map-embed';

const KEY_ICONS: Record<string, IconType> = {
  address: FiMapPin,
  fee: FiDollarSign,
  openTime: FiClock,
  parking: FiTruck,
  phone: FiPhone,
  price: FiDollarSign,
  ticket: FiDollarSign,
  traffic: FiNavigation,
  website: FiGlobe,
};

const KIND_ICONS: Record<PlaceFact['kind'], IconType> = {
  link: FiExternalLink,
  map: FiMapPin,
  phone: FiPhone,
  text: FiInfo,
};

const FactValue = ({
  fact,
  position,
}: {
  fact: PlaceFact;
  position: PlaceDetail['position'];
}) => {
  if (fact.kind === 'phone') {
    return (
      <Link href={`tel:${(fact.href ?? fact.value).replace(/[^\d+#,]/gu, '')}`}>
        {fact.value}
      </Link>
    );
  }
  if (fact.kind === 'link') {
    return (
      <ExternalLink href={fact.href ?? fact.value} wordBreak="break-all">
        {fact.value} ↗
      </ExternalLink>
    );
  }
  if (fact.kind === 'map') {
    const href = fact.href ?? (position ? mapSearchUrl(position) : undefined);

    return href ? (
      <ExternalLink href={href}>{fact.value} ↗</ExternalLink>
    ) : (
      fact.value
    );
  }

  return fact.value;
};

const FactCard = ({ detail }: { detail: PlaceDetail }) => {
  const directions = directionsUrl(detail.position);

  return (
    <Stack
      bg="bg"
      borderRadius="xl"
      borderWidth="1px"
      gap="5"
      p="5"
      position={{ lg: 'sticky' }}
      top={{ lg: '24' }}
    >
      <Text textStyle="title-sm">基本資訊</Text>
      {detail.facts.length > 0 && (
        <Stack as="dl" gap="4">
          {detail.facts.map((fact) => (
            <Grid gap="3" key={fact.key} templateColumns="1.25rem 1fr">
              <Icon color="colorPalette.fg" mt="1">
                {(() => {
                  const FactIcon = KEY_ICONS[fact.key] ?? KIND_ICONS[fact.kind];

                  return <FactIcon />;
                })()}
              </Icon>
              <Box>
                <Text as="dt" color="fg.muted" textStyle="body-sm">
                  {fact.label}
                </Text>
                <Text as="dd" textStyle="body" whiteSpace="pre-line">
                  <FactValue fact={fact} position={detail.position} />
                </Text>
              </Box>
            </Grid>
          ))}
        </Stack>
      )}
      <Stack gap="2">
        {detail.calendar ? <CalendarButton detail={detail} /> : null}
        {detail.reservationUrl ? (
          <Button asChild colorPalette="gray" variant="solid">
            <ExternalLink href={detail.reservationUrl}>
              前往訂位／訂房 ↗
            </ExternalLink>
          </Button>
        ) : null}
        {detail.websiteUrl ? (
          <Button asChild variant="outline">
            <ExternalLink href={detail.websiteUrl}>官方網站 ↗</ExternalLink>
          </Button>
        ) : null}
        {directions ? (
          <Button asChild variant="outline">
            <ExternalLink href={directions}>
              <FiNavigation />
              開啟地圖導航
            </ExternalLink>
          </Button>
        ) : null}
      </Stack>
      {detail.position ? (
        <MapEmbed
          lat={detail.position.lat}
          lng={detail.position.lng}
          name={detail.name}
        />
      ) : null}
    </Stack>
  );
};

export default FactCard;
