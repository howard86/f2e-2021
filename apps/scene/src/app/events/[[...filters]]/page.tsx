import { Container, Stack } from '@chakra-ui/react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import Layout from '@/components/layout/layout';
import FilterBar from '@/components/search/filter-bar';
import PlaceResults from '@/components/search/place-results';
import TabLinks from '@/components/search/tab-links';
import PageHero from '@/components/ui/page-hero';
import PlaceGridSkeleton from '@/components/ui/place-grid-skeleton';
import { ALL_CITIES } from '@/constants/preferences';
import { decodeSegments, eventsPath, parseEventsPath } from '@/lib/list-paths';
import { eventsStaticParams } from '@/lib/prerender';
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

// Major cities are prerendered on Vercel builds, the rest on first request;
// then served from the CDN for an hour.
export const revalidate = 3600;
export const generateStaticParams = eventsStaticParams;

const EventsPage = async ({
  params,
}: {
  params: Promise<{ filters?: string[] }>;
}) => {
  const parsed = parseEventsPath(decodeSegments((await params).filters));

  if (!parsed) {
    notFound();
  }

  const { city, when } = parsed;
  const realCity = city && city !== ALL_CITIES ? city : undefined;
  const isFree = when === 'free';
  const hrefForPage = (page: number) => eventsPath({ city, page, when });

  const tabs = [
    {
      href: eventsPath({ city, when: 'ongoing' }),
      label: '進行中',
    },
    {
      href: eventsPath({ city, when: 'upcoming' }),
      label: '即將開始',
    },
    {
      href: eventsPath({ city, when: 'free' }),
      label: '免費',
    },
  ];
  const activeHref = eventsPath({ city, when });

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
          <FilterBar
            city={city}
            showKeyword={false}
            type="activity"
            when={when}
          />
          <Suspense
            fallback={<PlaceGridSkeleton />}
            key={hrefForPage(parsed.page)}
          >
            <PlaceResults
              city={realCity}
              clearHref={eventsPath({ when })}
              free={isFree || undefined}
              hrefForPage={hrefForPage}
              page={parsed.page}
              type="activity"
              when={isFree ? undefined : when}
            />
          </Suspense>
        </Stack>
      </Container>
    </Layout>
  );
};

export default EventsPage;
