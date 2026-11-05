import { Box, Container, Stack } from '@chakra-ui/react';
import type { Metadata } from 'next';

import CityGrid from '@/components/home/city-grid';
import PreferredCityCard from '@/components/home/preferred-city-card';
import QuickLinks from '@/components/home/quick-links';
import Layout from '@/components/layout/layout';
import SearchForm from '@/components/search/search-form';
import PageHero from '@/components/ui/page-hero';
import PlaceGrid from '@/components/ui/place-grid';
import SectionHeading from '@/components/ui/section-heading';
import WeatherStrip from '@/components/weather/weather-strip';
import { HOME_SECTION_SIZE } from '@/constants/pagination';
import { listPath } from '@/lib/list-paths';
import { backgroundImage, OPEN_GRAPH_BASE, SITE_NAME } from '@/lib/seo';
import { listPlaces } from '@/services/places';
import getWeathers from '@/services/weather';
import mainBackground from '@/static/background/main.png';
import { PLACE_CATEGORY, PLACE_LABEL, type PlaceType } from '@/types/place';

export const revalidate = 21_600;

const DESCRIPTION =
  '用景點、美食、住宿與活動規劃台灣旅程，資料來自交通部 TDX 觀光資訊。';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  description: DESCRIPTION,
  openGraph: {
    ...OPEN_GRAPH_BASE,
    description: DESCRIPTION,
    images: [backgroundImage('main', SITE_NAME)],
    title: SITE_NAME,
  },
  title: { absolute: SITE_NAME },
};

const SECTION_TYPES: PlaceType[] = ['scene', 'restaurant', 'hotel'];

const HomePage = async () => {
  const [weathers, events, ...sections] = await Promise.all([
    getWeathers(),
    listPlaces({ pageSize: 4, type: 'activity', when: 'ongoing' }),
    ...SECTION_TYPES.map((type) =>
      listPlaces({ pageSize: HOME_SECTION_SIZE, type }),
    ),
  ]);

  return (
    <Layout colorPalette="scenes">
      <PageHero
        image={mainBackground}
        size="lg"
        subtitle="景點、美食、住宿與活動，一次找齊"
        title="台灣旅遊導覽網"
      >
        <SearchForm />
      </PageHero>
      <Container maxW="6xl" py={{ base: 6, md: 10 }}>
        <Stack gap="12">
          <QuickLinks />
          <PreferredCityCard />
          <WeatherStrip weathers={weathers} />
          {events.items.length > 0 ? (
            <Box colorPalette="activities">
              <SectionHeading
                action={{
                  href: listPath({ type: 'activity' }),
                  label: '查看更多',
                }}
                title="本週活動"
              />
              <Box mt="4">
                <PlaceGrid places={events.items} />
              </Box>
            </Box>
          ) : null}
          <Box>
            <SectionHeading title="熱門城市" />
            <Box mt="4">
              <CityGrid />
            </Box>
          </Box>
          {SECTION_TYPES.map((type, index) =>
            sections[index].items.length > 0 ? (
              <Box colorPalette={PLACE_CATEGORY[type]} key={type}>
                <SectionHeading
                  action={{ href: listPath({ type }), label: '查看更多' }}
                  title={PLACE_LABEL[type]}
                />
                <Box mt="4">
                  <PlaceGrid places={sections[index].items} />
                </Box>
              </Box>
            ) : null,
          )}
        </Stack>
      </Container>
    </Layout>
  );
};

export default HomePage;
