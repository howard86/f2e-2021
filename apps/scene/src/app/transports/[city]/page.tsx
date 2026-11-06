import { Breadcrumb, Container, Stack } from '@chakra-ui/react';
import { type City, CityMap, CitySet } from '@f2e/tdx-core';
import { RouteLink } from '@f2e/ui/links';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { BiChevronRight } from 'react-icons/bi';

import Layout from '@/components/layout/layout';
import {
  BikeSection,
  BusSection,
  MetroSection,
  NoticesSection,
  TraSection,
} from '@/components/transports/city-sections';
import { SectionSkeleton } from '@/components/transports/section-state';
import PageHero from '@/components/ui/page-hero';
import { supportsBikeData } from '@/constants/transports';
import { cityStaticParams } from '@/lib/prerender';
import { backgroundImage, OPEN_GRAPH_BASE } from '@/lib/seo';
import background from '@/static/background/transports.png';
import wordOne from '@/static/background/transports-1.png';
import wordTwo from '@/static/background/transports-2.png';

// Every city renders on first request (see lib/prerender.ts). A cold render
// needs more TDX calls than the 5-a-minute limit allows, so some sections
// degrade; the datasets carry their own cache lifetimes (services/
// transports.ts), so re-rendering every 10 minutes heals a degraded page
// from the warmed data cache without new TDX calls.
export const revalidate = 600;
export const generateStaticParams = cityStaticParams;

interface CityTransportsPageProps {
  params: Promise<{ city: string }>;
}

export const generateMetadata = async ({
  params,
}: CityTransportsPageProps): Promise<Metadata> => {
  const { city } = await params;

  if (!CitySet.has(city as City)) {
    return {};
  }

  const name = `${CityMap[city as City]}交通`;
  const description = `${CityMap[city as City]}的公車、自行車、捷運、台鐵與服務公告。`;

  return {
    alternates: { canonical: `/transports/${city}` },
    description,
    openGraph: {
      ...OPEN_GRAPH_BASE,
      description,
      images: [backgroundImage('transports', name)],
      title: name,
    },
    title: name,
  };
};

const CityTransportsPage = async ({ params }: CityTransportsPageProps) => {
  const { city: slug } = await params;

  if (!CitySet.has(slug as City)) {
    notFound();
  }

  const city = slug as City;
  const name = CityMap[city];

  return (
    <Layout colorPalette="transports">
      <PageHero
        image={background}
        size="md"
        subtitle="公車、自行車、捷運、台鐵與最新服務公告"
        title={`${name}交通`}
        wordImages={[wordOne, wordTwo]}
      />
      <Container maxW="6xl" py={{ base: 6, md: 10 }}>
        <Stack gap="10">
          <Breadcrumb.Root>
            <Breadcrumb.List flexWrap="wrap">
              <Breadcrumb.Item>
                <RouteLink as={Breadcrumb.Link} href="/">
                  首頁
                </RouteLink>
              </Breadcrumb.Item>
              <Breadcrumb.Separator>
                <BiChevronRight />
              </Breadcrumb.Separator>
              <Breadcrumb.Item>
                <RouteLink as={Breadcrumb.Link} href="/transports">
                  交通
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
          <RouteLink
            color="colorPalette.fg"
            href={`/${city}`}
            textStyle="body-sm"
          >
            看{name}的景點與美食 →
          </RouteLink>
          <Suspense fallback={<SectionSkeleton />}>
            <BusSection city={city} />
          </Suspense>
          {supportsBikeData(city) && (
            <Suspense fallback={<SectionSkeleton />}>
              <BikeSection city={city} />
            </Suspense>
          )}
          <Suspense fallback={null}>
            <MetroSection city={city} />
          </Suspense>
          <Suspense fallback={<SectionSkeleton />}>
            <TraSection city={city} />
          </Suspense>
          <Suspense fallback={<SectionSkeleton />}>
            <NoticesSection city={city} />
          </Suspense>
        </Stack>
      </Container>
    </Layout>
  );
};

export default CityTransportsPage;
