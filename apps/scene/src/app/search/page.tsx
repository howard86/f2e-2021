import { Box, Container, Stack, Text } from '@chakra-ui/react';
import { type City, CityMap } from '@f2e/tdx-core';
import { RouteLink } from '@f2e/ui/links';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Layout from '@/components/layout/layout';
import EmptyState from '@/components/search/empty-state';
import SearchForm from '@/components/search/search-form';
import {
  buildHref,
  parseCity,
  parseKeyword,
  type RawSearchParams,
} from '@/components/search/search-params';
import UnavailableState from '@/components/search/unavailable-state';
import PageHero from '@/components/ui/page-hero';
import PlaceGrid from '@/components/ui/place-grid';
import PlaceGridSkeleton from '@/components/ui/place-grid-skeleton';
import SectionHeading from '@/components/ui/section-heading';
import { ALL_CITIES } from '@/constants/preferences';
import { listPath } from '@/lib/list-paths';
import { DEFAULT_OG_IMAGE, OPEN_GRAPH_BASE } from '@/lib/seo';
import { searchPlaces } from '@/services/places';
import background from '@/static/background/main.png';
import { PLACE_CATEGORY, PLACE_LABEL, PLACE_TYPES } from '@/types/place';

const LIMIT_PER_TYPE = 8;

interface SearchPageProps {
  searchParams: Promise<RawSearchParams>;
}

export const generateMetadata = async ({
  searchParams,
}: SearchPageProps): Promise<Metadata> => {
  const q = parseKeyword((await searchParams).q);
  const title = q ? `搜尋「${q}」` : '搜尋';

  return {
    openGraph: { ...OPEN_GRAPH_BASE, images: [DEFAULT_OG_IMAGE], title },
    robots: { follow: true, index: false },
    title,
  };
};

const SearchResults = async ({ city, q }: { city?: City; q: string }) => {
  const allHref = buildHref('/search', { city: ALL_CITIES, q });
  let places: Awaited<ReturnType<typeof searchPlaces>>;

  try {
    places = await searchPlaces(q, LIMIT_PER_TYPE, city);
  } catch (error) {
    console.warn('[places] search unavailable', error);
    return <UnavailableState retryHref={buildHref('/search', { city, q })} />;
  }

  if (places.length === 0) {
    return (
      <EmptyState
        action={
          city
            ? { href: allHref, label: '改搜尋全台' }
            : {
                href: listPath({ city: 'all', type: 'scene' }),
                label: '瀏覽所有景點',
              }
        }
        description="試試其他關鍵字，或縮短搜尋字詞。"
        title={`${city ? `在${CityMap[city]}` : ''}找不到與「${q}」相關的結果`}
      />
    );
  }

  return (
    <Stack gap="12">
      {city ? (
        <Text color="fg.muted" textStyle="body-sm">
          只顯示{CityMap[city]}的結果 ·{' '}
          <RouteLink color="colorPalette.fg" href={allHref}>
            搜尋全台
          </RouteLink>
        </Text>
      ) : null}
      {PLACE_TYPES.map((type) => {
        const group = places.filter((place) => place.type === type);

        if (group.length === 0) {
          return null;
        }

        return (
          <Box colorPalette={PLACE_CATEGORY[type]} key={type}>
            <SectionHeading
              action={{
                href: listPath({ city: city ?? 'all', type }),
                label: `瀏覽全部${PLACE_LABEL[type]}`,
              }}
              title={`${PLACE_LABEL[type]}（${group.length}）`}
            />
            <Box mt="4">
              <PlaceGrid places={group} />
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const raw = await searchParams;
  const q = parseKeyword(raw.q);
  const city = parseCity(raw.city);

  return (
    <Layout colorPalette="scenes">
      <PageHero
        image={background}
        size="md"
        subtitle="一次搜尋景點、美食、住宿與活動"
        title={q ? `搜尋「${q}」` : '搜尋'}
      >
        <SearchForm defaultValue={q} />
      </PageHero>
      <Container maxW="6xl" py={{ base: 6, md: 10 }}>
        {q ? (
          <Suspense fallback={<PlaceGridSkeleton />} key={`${q}-${city}`}>
            <SearchResults city={city} q={q} />
          </Suspense>
        ) : (
          <EmptyState
            description="輸入景點名稱、餐廳、旅館或活動關鍵字。"
            title="想去哪裡看看？"
          />
        )}
      </Container>
    </Layout>
  );
};

export default SearchPage;
