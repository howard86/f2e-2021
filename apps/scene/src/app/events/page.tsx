import { Container, Stack } from '@chakra-ui/react';
import type { Metadata } from 'next';
import { Suspense } from 'react';

import Layout from '@/components/layout/layout';
import FilterBar from '@/components/search/filter-bar';
import PlaceResults from '@/components/search/place-results';
import {
  buildHref,
  parseListParams,
  type RawSearchParams,
} from '@/components/search/search-params';
import TabLinks from '@/components/search/tab-links';
import PageHero from '@/components/ui/page-hero';
import PlaceGridSkeleton from '@/components/ui/place-grid-skeleton';
import { ALL_CITIES } from '@/constants/preferences';
import background from '@/static/background/events.png';
import wordOne from '@/static/background/events-1.png';
import wordTwo from '@/static/background/events-2.png';

const DESCRIPTION = '進行中與即將開始的全台活動、節慶與展覽。';

export const metadata: Metadata = {
  description: DESCRIPTION,
  openGraph: {
    description: DESCRIPTION,
    images: ['/static/background/events.png'],
  },
  title: '台灣旅遊導覽網 | 活動',
};

const EventsPage = async ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => {
  const params = parseListParams(await searchParams);
  const { allCities, city } = params;
  const cityParam = city ?? (allCities ? ALL_CITIES : undefined);
  const isFree = params.free === true;
  const when = isFree ? undefined : (params.when ?? 'ongoing');
  const activeKey = isFree ? 'free' : when;

  const tabs = [
    {
      href: buildHref('/events', { city: cityParam, when: 'ongoing' }),
      key: 'ongoing',
      label: '進行中',
    },
    {
      href: buildHref('/events', { city: cityParam, when: 'upcoming' }),
      key: 'upcoming',
      label: '即將開始',
    },
    {
      href: buildHref('/events', { city: cityParam, free: '1' }),
      key: 'free',
      label: '免費',
    },
  ];
  const activeHref = tabs.find((tab) => tab.key === activeKey)?.href ?? '';
  const preserve = isFree ? { free: '1' } : { when };
  const suspenseKey = `${activeKey}-${cityParam}-${params.page}`;

  return (
    <Layout colorPalette="activities">
      <PageHero
        image={background}
        size="lg"
        subtitle={DESCRIPTION}
        title="活動"
        wordImages={[wordOne, wordTwo]}
      />
      <Container maxW="6xl" py={{ base: 6, md: 10 }}>
        <Stack gap="6">
          <TabLinks activeHref={activeHref} label="活動類型" tabs={tabs} />
          <FilterBar city={city} preserve={preserve} showKeyword={false} />
          <Suspense fallback={<PlaceGridSkeleton />} key={suspenseKey}>
            <PlaceResults
              allCities={allCities}
              basePath="/events"
              city={city}
              clearHref={buildHref('/events', preserve)}
              free={isFree || undefined}
              page={params.page}
              type="activity"
              when={when}
            />
          </Suspense>
        </Stack>
      </Container>
    </Layout>
  );
};

export default EventsPage;
