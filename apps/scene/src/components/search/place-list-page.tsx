import { Box, Container } from '@chakra-ui/react';
import type { StaticImageData } from 'next/image';
import { Suspense } from 'react';

import Layout from '@/components/layout/layout';
import PageHero from '@/components/ui/page-hero';
import PlaceGridSkeleton from '@/components/ui/place-grid-skeleton';
import { getTagOptions } from '@/services/places';
import { PLACE_CATEGORY, PLACE_LABEL, type PlaceType } from '@/types/place';

import FilterBar from './filter-bar';
import PlaceResults from './place-results';
import {
  buildHref,
  parseListParams,
  type RawSearchParams,
  toQueryRecord,
} from './search-params';

interface PlaceListPageProps {
  basePath: string;
  image: StaticImageData;
  searchParams: Promise<RawSearchParams>;
  subtitle: string;
  type: PlaceType;
  wordImages: [StaticImageData, StaticImageData];
}

/** Shared body of /scenes, /restaurants and /hotels; the URL holds all state. */
const PlaceListPage = async ({
  basePath,
  image,
  searchParams,
  subtitle,
  type,
  wordImages,
}: PlaceListPageProps) => {
  const tagOptions = getTagOptions(type);
  const params = parseListParams(
    await searchParams,
    tagOptions.map((option) => option.value),
  );
  const query = toQueryRecord(params);
  const suspenseKey = buildHref(basePath, {
    ...query,
    page: String(params.page),
  });

  return (
    <Layout colorPalette={PLACE_CATEGORY[type]}>
      <PageHero
        image={image}
        size="lg"
        subtitle={subtitle}
        title={PLACE_LABEL[type]}
        wordImages={wordImages}
      />
      <Container maxW="6xl" py={{ base: 6, md: 10 }}>
        <FilterBar
          city={params.city}
          q={params.q}
          tag={params.tag}
          tagOptions={tagOptions}
        />
        <Box mt="8">
          <Suspense fallback={<PlaceGridSkeleton />} key={suspenseKey}>
            <PlaceResults
              basePath={basePath}
              city={params.city}
              page={params.page}
              q={params.q}
              tag={params.tag}
              type={type}
            />
          </Suspense>
        </Box>
      </Container>
    </Layout>
  );
};

export default PlaceListPage;
