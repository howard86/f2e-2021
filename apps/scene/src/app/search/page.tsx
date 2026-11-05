import { Box, Container, Stack } from '@chakra-ui/react';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Layout from '@/components/layout/layout';
import EmptyState from '@/components/search/empty-state';
import SearchForm from '@/components/search/search-form';
import {
  parseKeyword,
  type RawSearchParams,
} from '@/components/search/search-params';
import PageHero from '@/components/ui/page-hero';
import PlaceGrid from '@/components/ui/place-grid';
import PlaceGridSkeleton from '@/components/ui/place-grid-skeleton';
import SectionHeading from '@/components/ui/section-heading';
import { searchPlaces } from '@/services/places';
import background from '@/static/background/main.png';
import {
  PLACE_CATEGORY,
  PLACE_LABEL,
  PLACE_LIST_HREF,
  PLACE_TYPES,
} from '@/types/place';

const LIMIT_PER_TYPE = 8;

interface SearchPageProps {
  searchParams: Promise<RawSearchParams>;
}

export const generateMetadata = async ({
  searchParams,
}: SearchPageProps): Promise<Metadata> => {
  const q = parseKeyword((await searchParams).q);

  return {
    robots: { index: false },
    title: q ? `台灣旅遊導覽網 | 搜尋「${q}」` : '台灣旅遊導覽網 | 搜尋',
  };
};

const SearchResults = async ({ q }: { q: string }) => {
  const places = await searchPlaces(q, LIMIT_PER_TYPE);

  if (places.length === 0) {
    return (
      <EmptyState
        action={{ href: '/scenes', label: '瀏覽所有景點' }}
        description="試試其他關鍵字，或縮短搜尋字詞。"
        title={`找不到與「${q}」相關的結果`}
      />
    );
  }

  return (
    <Stack gap="12">
      {PLACE_TYPES.map((type) => {
        const group = places.filter((place) => place.type === type);

        if (group.length === 0) {
          return null;
        }

        return (
          <Box colorPalette={PLACE_CATEGORY[type]} key={type}>
            <SectionHeading
              action={{
                href: `${PLACE_LIST_HREF[type]}?q=${encodeURIComponent(q)}`,
                label: '查看全部',
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
  const q = parseKeyword((await searchParams).q);

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
          <Suspense fallback={<PlaceGridSkeleton />} key={q}>
            <SearchResults q={q} />
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
