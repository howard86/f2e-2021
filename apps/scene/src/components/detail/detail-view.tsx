import {
  Badge,
  Box,
  Breadcrumb,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react';
import { ExternalLink, RouteLink } from '@f2e/ui/links';
import { Suspense } from 'react';
import { FiNavigation } from 'react-icons/fi';

import PlaceGrid from '@/components/ui/place-grid';
import PlaceGridSkeleton from '@/components/ui/place-grid-skeleton';
import Prose from '@/components/ui/prose';
import SectionHeading from '@/components/ui/section-heading';
import TagChips from '@/components/ui/tag-chips';
import { listPath } from '@/lib/list-paths';
import { getNearbyPlaces, getTagOptions } from '@/services/places';
import {
  PLACE_LABEL,
  type PlaceDetail,
  type PlaceStatusTone,
  type PlaceSummary,
} from '@/types/place';

import Collapsible from './collapsible';
import FactCard from './fact-card';
import Gallery from './gallery';
import {
  buildJsonLd,
  directionsUrl,
  formatDate,
  serializeJsonLd,
  shouldCollapse,
} from './helpers';
import SaveButton from './save-button';
import ShareButton from './share-button';

const TONE_PALETTE: Record<PlaceStatusTone, string> = {
  negative: 'red',
  neutral: 'gray',
  positive: 'green',
};

const toPlaceSummary = (detail: PlaceDetail): PlaceSummary => ({
  city: detail.city,
  citySlug: detail.citySlug,
  endDate: detail.endDate,
  href: detail.href,
  id: detail.id,
  image: detail.image ?? detail.images[0],
  isFree: detail.isFree,
  keyFact: detail.keyFact,
  name: detail.name,
  startDate: detail.startDate,
  tags: detail.tags,
  town: detail.town,
  type: detail.type,
});

const Body = ({ text }: { text: string }) => (
  <Collapsible collapsible={shouldCollapse(text)}>
    <Prose whiteSpace="pre-line">{text}</Prose>
  </Collapsible>
);

const Nearby = async ({ detail }: { detail: PlaceDetail }) => {
  const places = await getNearbyPlaces(detail);

  return places.length > 0 ? <PlaceGrid places={places} /> : null;
};

const DetailView = ({ detail }: { detail: PlaceDetail }) => {
  const tagValues = new Map(
    getTagOptions(detail.type).map((option) => [option.label, option.value]),
  );
  const tagHref = (label: string) => {
    const value = tagValues.get(label);

    // Event lists have no tag filter, so activity labels go to search.
    return value && detail.type !== 'activity'
      ? listPath({ city: 'all', tag: value, type: detail.type })
      : `/search?q=${encodeURIComponent(label)}`;
  };
  const directions = directionsUrl(detail.position);
  const updated = formatDate(detail.updatedAt);

  return (
    <Container maxW="6xl" pb="16" pt="24">
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: serialized JSON-LD with "<" escaped
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildJsonLd(detail)),
        }}
        type="application/ld+json"
      />
      <Breadcrumb.Root>
        <Breadcrumb.List flexWrap="wrap">
          <Breadcrumb.Item>
            <RouteLink as={Breadcrumb.Link} href="/">
              首頁
            </RouteLink>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <RouteLink as={Breadcrumb.Link} href={`/${detail.citySlug}`}>
              {detail.city}
            </RouteLink>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <RouteLink
              as={Breadcrumb.Link}
              href={listPath({ city: detail.citySlug, type: detail.type })}
            >
              {PLACE_LABEL[detail.type]}
            </RouteLink>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.CurrentLink>{detail.name}</Breadcrumb.CurrentLink>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>

      <Stack as="header" gap="4" mt="6">
        <Text color="colorPalette.fg" fontWeight="semibold" textStyle="body-sm">
          {PLACE_LABEL[detail.type]}
        </Text>
        <Heading as="h1" textStyle="display">
          {detail.name}
        </Heading>
        <HStack flexWrap="wrap" gap="2">
          <Badge colorPalette="gray" size="lg" variant="subtle">
            {[detail.town, detail.city].filter(Boolean).join('，')}
          </Badge>
          {detail.status ? (
            <Badge
              colorPalette={TONE_PALETTE[detail.status.tone]}
              size="lg"
              variant="subtle"
            >
              {detail.status.label}
            </Badge>
          ) : null}
        </HStack>
        {detail.tags.length > 0 && (
          <TagChips hrefFor={tagHref} tags={detail.tags} />
        )}
        <Flex flexWrap="wrap" gap="2">
          <SaveButton place={toPlaceSummary(detail)} />
          <ShareButton title={detail.name} />
          {directions ? (
            <Button asChild colorPalette="gray" size="sm" variant="outline">
              <ExternalLink href={directions}>
                <FiNavigation />
                導航
              </ExternalLink>
            </Button>
          ) : null}
        </Flex>
      </Stack>

      <Box mt="8">
        <Gallery images={detail.images} name={detail.name} />
      </Box>

      <Grid
        alignItems="start"
        gap={{ base: '8', lg: '12' }}
        mt="10"
        templateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) 22rem' }}
      >
        <Stack gap="10" minW="0">
          {detail.description ? <Body text={detail.description} /> : null}
          {detail.sections.map((section) => (
            <Stack as="section" gap="3" key={section.key}>
              <Heading as="h2" textStyle="title-md">
                {section.title}
              </Heading>
              {section.steps && section.steps.length > 0 ? (
                <Collapsible collapsible={shouldCollapse(section.body)}>
                  <Prose as="ol" listStylePosition="outside" ps="5">
                    {section.steps.map((step) => (
                      <Box
                        as="li"
                        key={`${step.heading ?? ''}${step.text}`}
                        mb="3"
                      >
                        {step.heading ? (
                          <Heading as="h3" textStyle="title-sm">
                            {step.heading}
                          </Heading>
                        ) : null}
                        <Text whiteSpace="pre-line">{step.text}</Text>
                      </Box>
                    ))}
                  </Prose>
                </Collapsible>
              ) : (
                <Body text={section.body} />
              )}
            </Stack>
          ))}
        </Stack>
        <FactCard detail={detail} />
      </Grid>

      <Box as="section" mt="16">
        <SectionHeading title="附近推薦" />
        <Box mt="6">
          <Suspense fallback={<PlaceGridSkeleton />}>
            <Nearby detail={detail} />
          </Suspense>
        </Box>
      </Box>

      <Text color="fg.muted" mt="12" textStyle="body-sm">
        {updated ? `資料更新：${updated} · ` : ''}資料來源：交通部觀光署 / TDX
      </Text>
    </Container>
  );
};

export default DetailView;
