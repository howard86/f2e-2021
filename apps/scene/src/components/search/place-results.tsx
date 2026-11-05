import { Stack, Text } from '@chakra-ui/react';
import { type City, CityMap } from '@f2e/tdx-core';

import Pager from '@/components/ui/pager';
import PlaceGrid from '@/components/ui/place-grid';
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination';
import { listPlaces } from '@/services/places';
import { type ActivityWhen, PLACE_LABEL, type PlaceType } from '@/types/place';

import EmptyState from './empty-state';
import { buildHref, toQueryRecord } from './search-params';
import UnavailableState from './unavailable-state';

interface PlaceResultsProps {
  basePath: string;
  city?: City;
  /** Where 清除篩選 goes; defaults to the base path. */
  clearHref?: string;
  free?: boolean;
  /**
   * Replaces the params carried on pager links. Passing it also means the city
   * is fixed by the route, so it is not shown as a removable filter.
   */
  linkQuery?: Record<string, string | undefined>;
  page: number;
  q?: string;
  tag?: string;
  type: PlaceType;
  when?: ActivityWhen;
}

const PlaceResults = async ({
  basePath,
  city,
  clearHref = basePath,
  free,
  linkQuery,
  page,
  q,
  tag,
  type,
  when,
}: PlaceResultsProps) => {
  const fixedCity = linkQuery !== undefined;
  const query = linkQuery ?? toQueryRecord({ city, free, q, tag, when });
  let result: Awaited<ReturnType<typeof listPlaces>>;

  try {
    result = await listPlaces({
      city,
      free,
      keyword: q,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      tag,
      type,
      when,
    });
  } catch (error) {
    console.warn('[places] list unavailable', error);
    return (
      <UnavailableState
        retryHref={buildHref(basePath, {
          ...query,
          page: page > 1 ? String(page) : undefined,
        })}
      />
    );
  }
  const filtered = Boolean((city && !fixedCity) || q || tag || free);

  if (result.items.length === 0) {
    return page > 1 ? (
      <EmptyState
        action={{ href: buildHref(basePath, query), label: '回到第一頁' }}
        title="這一頁沒有更多資料"
      />
    ) : (
      <EmptyState
        action={filtered ? { href: clearHref, label: '清除篩選' } : undefined}
        description={
          filtered ? '試試其他關鍵字，或放寬篩選條件。' : '稍後再回來看看。'
        }
        title={`找不到符合的${PLACE_LABEL[type]}`}
      />
    );
  }

  return (
    <Stack gap="6">
      <Text color="fg.muted" textStyle="body-sm">
        {[
          city && !fixedCity ? CityMap[city] : undefined,
          q ? `「${q}」` : undefined,
          `第 ${result.page} 頁，本頁 ${result.items.length} 筆${PLACE_LABEL[type]}`,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Text>
      <PlaceGrid places={result.items} />
      {page > 1 || result.hasMore ? (
        <Pager
          basePath={basePath}
          hasMore={result.hasMore}
          page={result.page}
          searchParams={query}
        />
      ) : null}
    </Stack>
  );
};

export default PlaceResults;
