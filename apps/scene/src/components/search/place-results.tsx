import { Stack, Text } from '@chakra-ui/react';
import { type City, CityMap } from '@f2e/tdx-core';

import Pager from '@/components/ui/pager';
import PlaceGrid from '@/components/ui/place-grid';
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination';
import { listPlaces } from '@/services/places';
import { type ActivityWhen, PLACE_LABEL, type PlaceType } from '@/types/place';

import EmptyState from './empty-state';

interface PlaceResultsProps {
  city?: City;
  /** Where 清除篩選 goes. */
  clearHref: string;
  free?: boolean;
  /** Path of a 1-based page of this same list. */
  hrefForPage: (page: number) => string;
  page: number;
  tag?: string;
  type: PlaceType;
  when?: ActivityWhen;
}

/**
 * Results of a cached (ISR) list page. A TDX failure is deliberately not
 * caught: throwing keeps the last good page, while a rendered "unavailable"
 * state would be cached for hours.
 */
const PlaceResults = async ({
  city,
  clearHref,
  free,
  hrefForPage,
  page,
  tag,
  type,
  when,
}: PlaceResultsProps) => {
  const result = await listPlaces({
    city,
    free,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    tag,
    type,
    when,
  });
  const filtered = Boolean(city || tag || free);

  if (result.items.length === 0) {
    return page > 1 ? (
      <EmptyState
        action={{ href: hrefForPage(1), label: '回到第一頁' }}
        title="這一頁沒有更多資料"
      />
    ) : (
      <EmptyState
        action={filtered ? { href: clearHref, label: '清除篩選' } : undefined}
        description={filtered ? '試試放寬篩選條件。' : '稍後再回來看看。'}
        title={`找不到符合的${PLACE_LABEL[type]}`}
      />
    );
  }

  return (
    <Stack gap="6">
      <Text color="fg.muted" textStyle="body-sm">
        {[
          city ? CityMap[city] : undefined,
          `第 ${result.page} 頁，本頁 ${result.items.length} 筆${PLACE_LABEL[type]}`,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Text>
      <PlaceGrid places={result.items} />
      {page > 1 || result.hasMore ? (
        <Pager
          hasMore={result.hasMore}
          hrefForPage={hrefForPage}
          page={result.page}
        />
      ) : null}
    </Stack>
  );
};

export default PlaceResults;
