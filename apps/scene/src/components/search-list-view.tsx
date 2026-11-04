import { SimpleGrid } from '@chakra-ui/react';
import type { ReactNode } from 'react';

import CardGridSkeleton from '@/components/card-grid-skeleton';
import { EmptyResult, ErrorResult } from '@/components/result-state';
import SectionBanner from '@/components/section-banner';
import type useKeywordSearch from '@/hooks/use-keyword-search';

interface SearchResultsProps<T> {
  renderItem: (item: T) => ReactNode;
  search: Pick<
    ReturnType<typeof useKeywordSearch<T>>,
    'items' | 'retry' | 'status' | 'submittedKeyword'
  >;
}

/** Keyword-search results section shared by the scenes/restaurants/hotels lists. */
const SearchResults = <T,>({ renderItem, search }: SearchResultsProps<T>) => {
  const { items, retry, status, submittedKeyword } = search;

  if (status === 'idle') {
    return null;
  }

  if (status === 'error') {
    return <ErrorResult onRetry={retry} />;
  }

  return (
    <>
      <SectionBanner mt="0" title={`搜尋『${submittedKeyword}』的結果...`} />
      {status === 'loading' && <CardGridSkeleton mx="8" />}
      {status === 'empty' && <EmptyResult keyword={submittedKeyword} />}
      {status === 'success' && (
        <SimpleGrid columns={[1, 2, 3]} gap={6} mx="8">
          {items.map(renderItem)}
        </SimpleGrid>
      )}
    </>
  );
};

export default SearchResults;
