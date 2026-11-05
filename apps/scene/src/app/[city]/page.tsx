import { Box, Breadcrumb, Container, Stack } from '@chakra-ui/react';
import { type City, CityMap, CitySet } from '@f2e/tdx-core';
import { RouteLink } from '@f2e/ui/links';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { BiChevronRight } from 'react-icons/bi';

import Layout from '@/components/layout/layout';
import EmptyState from '@/components/search/empty-state';
import PageHero from '@/components/ui/page-hero';
import PlaceGrid from '@/components/ui/place-grid';
import PlaceGridSkeleton from '@/components/ui/place-grid-skeleton';
import SectionHeading from '@/components/ui/section-heading';
import WeatherStrip from '@/components/weather/weather-strip';
import { CITY_OVERVIEW_SIZE } from '@/constants/pagination';
import { listPath } from '@/lib/list-paths';
import { cityStaticParams } from '@/lib/prerender';
import { backgroundImage, OPEN_GRAPH_BASE } from '@/lib/seo';
import { listPlaces } from '@/services/places';
import getWeathers from '@/services/weather';
import background from '@/static/background/scenes.png';
import { PLACE_CATEGORY, PLACE_LABEL, PLACE_TYPES } from '@/types/place';

// Every city renders on first request (see lib/prerender.ts), then is
// served from the CDN for six hours.
export const revalidate = 21_600;
export const generateStaticParams = cityStaticParams;

interface CityPageProps {
  params: Promise<{ city: string }>;
}

export const generateMetadata = async ({
  params,
}: Pick<CityPageProps, 'params'>): Promise<Metadata> => {
  const { city } = await params;

  if (!CitySet.has(city as City)) {
    return {};
  }

  const name = CityMap[city as City];
  const description = `${name}的景點、美食、住宿與活動。`;

  return {
    alternates: { canonical: `/${city}` },
    description,
    openGraph: {
      ...OPEN_GRAPH_BASE,
      description,
      images: [backgroundImage('scenes', name)],
      title: name,
    },
    title: name,
  };
};

const CityOverview = async ({ city }: { city: City }) => {
  // Throws if any type fails: a partial overview would be cached for hours.
  const loaded = await Promise.all(
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
              href: listPath({ city, type }),
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

const CityPage = async ({ params }: CityPageProps) => {
  const { city: slug } = await params;

  if (!CitySet.has(slug as City)) {
    notFound();
  }

  const city = slug as City;
  const name = CityMap[city];
  const weather = (await getWeathers()).filter((item) => item.city === name);

  return (
    <Layout colorPalette="scenes">
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
          <Suspense fallback={<PlaceGridSkeleton />}>
            <CityOverview city={city} />
          </Suspense>
        </Stack>
      </Container>
    </Layout>
  );
};

export default CityPage;
