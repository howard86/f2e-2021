import { Box, Container } from '@chakra-ui/react';
import type { Metadata } from 'next';
import type { StaticImageData } from 'next/image';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import Layout from '@/components/layout/layout';
import PageHero from '@/components/ui/page-hero';
import PlaceGridSkeleton from '@/components/ui/place-grid-skeleton';
import { ALL_CITIES } from '@/constants/preferences';
import { buildListMetadata } from '@/lib/list-metadata';
import { decodeSegments, listPath, parseListPath } from '@/lib/list-paths';
import { getTagOptions } from '@/services/places';
import { PLACE_CATEGORY, PLACE_LABEL, type PlaceType } from '@/types/place';

import FilterBar from './filter-bar';
import PlaceResults from './place-results';

interface PlaceListPageProps {
  image: StaticImageData;
  params: Promise<{ filters?: string[] }>;
  subtitle: string;
  type: PlaceType;
  wordImages: [StaticImageData, StaticImageData];
}

/** `generateMetadata` for /scenes, /restaurants and /hotels; {} when the path 404s. */
export const placeListMetadata = async (
  type: PlaceType,
  params: Promise<{ filters?: string[] }>,
): Promise<Metadata> => {
  const tagOptions = getTagOptions(type);
  const parsed = parseListPath(
    decodeSegments((await params).filters),
    tagOptions.map((option) => option.value),
  );

  if (!parsed) {
    return {};
  }

  return buildListMetadata({
    ...parsed,
    tagLabel: tagOptions.find((option) => option.value === parsed.tag)?.label,
    type,
  });
};

/**
 * Shared body of /scenes, /restaurants and /hotels. Every filter is in the
 * path, so the page is cached (ISR) per URL and never reads the request.
 */
const PlaceListPage = async ({
  image,
  params,
  subtitle,
  type,
  wordImages,
}: PlaceListPageProps) => {
  const tagOptions = getTagOptions(type);
  const parsed = parseListPath(
    decodeSegments((await params).filters),
    tagOptions.map((option) => option.value),
  );

  if (!parsed) {
    notFound();
  }

  const { city, tag } = parsed;
  const realCity = city && city !== ALL_CITIES ? city : undefined;
  const hrefForPage = (page: number) => listPath({ city, page, tag, type });

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
        <FilterBar city={city} tag={tag} tagOptions={tagOptions} type={type} />
        <Box mt="8">
          <Suspense
            fallback={<PlaceGridSkeleton />}
            key={hrefForPage(parsed.page)}
          >
            <PlaceResults
              city={realCity}
              clearHref={listPath({ type })}
              hrefForPage={hrefForPage}
              page={parsed.page}
              tag={tag}
              type={type}
            />
          </Suspense>
        </Box>
      </Container>
    </Layout>
  );
};

export default PlaceListPage;
