import { Box, Breadcrumb, Container, Stack } from '@chakra-ui/react';
import { type City, CityMap, CitySet } from '@f2e/tdx-core';
import { RouteLink } from '@f2e/ui/links';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { BiChevronRight } from 'react-icons/bi';

import Layout from '@/components/layout/layout';
import EmptyState from '@/components/search/empty-state';
import PlaceResults from '@/components/search/place-results';
import {
  buildHref,
  parsePage,
  type RawSearchParams,
} from '@/components/search/search-params';
import TabLinks from '@/components/search/tab-links';
import UnavailableState from '@/components/search/unavailable-state';
import PageHero from '@/components/ui/page-hero';
import PlaceGrid from '@/components/ui/place-grid';
import PlaceGridSkeleton from '@/components/ui/place-grid-skeleton';
import SectionHeading from '@/components/ui/section-heading';
import WeatherStrip from '@/components/weather/weather-strip';
import { CITY_OVERVIEW_SIZE } from '@/constants/pagination';
import { listPlaces } from '@/services/places';
import getWeathers from '@/services/weather';
import background from '@/static/background/scenes.png';
import {
  PLACE_CATEGORY,
  PLACE_LABEL,
  PLACE_LIST_HREF,
  PLACE_TYPES,
  type PlaceType,
} from '@/types/place';

// Rendered per request: it reads ?tab and ?page, which a statically cached
// (ISR) route cannot do. Its TDX data is still cached in services/places.ts.
interface CityPageProps {
  params: Promise<{ city: string }>;
  searchParams: Promise<RawSearchParams>;
}

const parseTab = (
  value: string | string[] | undefined,
): PlaceType | undefined => {
  const tab = Array.isArray(value) ? value[0] : value;

  return PLACE_TYPES.find((type) => type === tab);
};

export const generateMetadata = async ({
  params,
}: Pick<CityPageProps, 'params'>): Promise<Metadata> => {
  const { city } = await params;

  if (!CitySet.has(city as City)) {
    return {};
  }

  const name = CityMap[city as City];

  return {
    description: `${name}的景點、美食、住宿與活動。`,
    openGraph: { images: ['/static/background/scenes.png'] },
    title: `台灣旅遊導覽網 | ${name}`,
  };
};

const CityOverview = async ({ city }: { city: City }) => {
  // Each type is fetched on its own so one rate-limited type doesn't blank
  // the whole overview.
  const results = await Promise.allSettled(
    PLACE_TYPES.map(async (type) => ({
      page: await listPlaces({
        city,
        pageSize: CITY_OVERVIEW_SIZE,
        type,
        when: type === 'activity' ? 'ongoing' : undefined,
      }),
      type,
    })),
  );
  const loaded = results.flatMap((result) =>
    result.status === 'fulfilled' ? [result.value] : [],
  );

  if (loaded.length === 0) {
    console.warn('[places] city overview unavailable', city);
    return <UnavailableState retryHref={`/${city}`} />;
  }

  const sections = loaded.filter(({ page }) => page.items.length > 0);

  if (sections.length === 0) {
    return (
      <EmptyState
        description="目前沒有這個縣市的資料，稍後再回來看看。"
        title={`${CityMap[city]}暫無資料`}
      />
    );
  }

  return (
    <Stack gap="12">
      {sections.map(({ page, type }) => (
        <Box colorPalette={PLACE_CATEGORY[type]} key={type}>
          <SectionHeading
            action={{
              href: `${PLACE_LIST_HREF[type]}?city=${city}`,
              label: '查看更多',
            }}
            title={PLACE_LABEL[type]}
          />
          <Box mt="4">
            <PlaceGrid places={page.items} />
          </Box>
        </Box>
      ))}
    </Stack>
  );
};

const CityPage = async ({ params, searchParams }: CityPageProps) => {
  const { city: slug } = await params;

  if (!CitySet.has(slug as City)) {
    notFound();
  }

  const city = slug as City;
  const name = CityMap[city];
  const raw = await searchParams;
  const tab = parseTab(raw.tab);
  const page = parsePage(raw.page);
  const weather = (await getWeathers()).filter((item) => item.city === name);

  const tabs = [
    { href: `/${city}`, label: '總覽' },
    ...PLACE_TYPES.map((type) => ({
      href: buildHref(`/${city}`, { tab: type }),
      label: PLACE_LABEL[type],
    })),
  ];
  const activeHref = tab ? buildHref(`/${city}`, { tab }) : `/${city}`;

  return (
    <Layout colorPalette={tab ? PLACE_CATEGORY[tab] : 'scenes'}>
      <PageHero
        image={background}
        size="md"
        subtitle="景點、美食、住宿與活動一次看"
        title={name}
      >
        <WeatherStrip mode="periods" weathers={weather} />
      </PageHero>
      <Container maxW="6xl" py={{ base: 6, md: 10 }}>
        <Stack gap="6">
          <Breadcrumb.Root>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <RouteLink as={Breadcrumb.Link} href="/">
                  首頁
                </RouteLink>
              </Breadcrumb.Item>
              <Breadcrumb.Separator>
                <BiChevronRight />
              </Breadcrumb.Separator>
              <Breadcrumb.Item>
                <Breadcrumb.CurrentLink>{name}</Breadcrumb.CurrentLink>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
          <TabLinks activeHref={activeHref} label="內容類型" tabs={tabs} />
          {tab ? (
            <Suspense fallback={<PlaceGridSkeleton />} key={`${tab}-${page}`}>
              <PlaceResults
                basePath={`/${city}`}
                city={city}
                linkQuery={{ tab }}
                page={page}
                type={tab}
              />
            </Suspense>
          ) : (
            <Suspense fallback={<PlaceGridSkeleton />}>
              <CityOverview city={city} />
            </Suspense>
          )}
        </Stack>
      </Container>
    </Layout>
  );
};

export default CityPage;
