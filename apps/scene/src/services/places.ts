// The app's data layer over TDX Tourism V2. Every TDX call goes through
// `fetchRecords` / `fetchById`: cached across requests with unstable_cache
// (still supported in Next 16 without `cacheComponents`, which is a
// next.config seam; `use cache` + cacheLife would need it) and deduped per
// request with React cache(). Records are cached raw and mapped per request,
// so derived values such as an event's 進行中 status never go stale.
import type { City } from '@f2e/tdx-core';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import {
  distanceKm,
  type PlaceRecord,
  positionOf,
  toDetail,
  toSummary,
} from '@/services/place-mappers';
import {
  buildListRequest,
  getTagOptionsFor,
  hasMoreRows,
  isCity,
  isPlaceType,
  isValidId,
  normalizeKeyword,
  orderByFor,
  taipeiDate,
} from '@/services/place-queries';
import { tourismService } from '@/services/tdx';
import {
  PLACE_TYPES,
  type PlaceDetail,
  type PlacePage,
  type PlaceQuery,
  type PlaceSummary,
  type PlaceType,
  type TagOption,
} from '@/types/place';

const SIX_HOURS = 6 * 60 * 60;
const ONE_HOUR = 60 * 60;
const NEARBY_FETCH = 20;
const DEFAULT_NEARBY = 6;
const DEFAULT_SEARCH_LIMIT = 6;

interface Fetched {
  fetched: number;
  items: PlaceRecord[];
}

const listFor = (type: PlaceType) => {
  switch (type) {
    case 'scene':
      return tourismService.getAttractionsV2;
    case 'restaurant':
      return tourismService.getRestaurantsV2;
    case 'hotel':
      return tourismService.getHotelsV2;
    default:
      return tourismService.getEventsV2;
  }
};

const byIdFor = (type: PlaceType) => {
  switch (type) {
    case 'scene':
      return tourismService.getAttractionByIdV2;
    case 'restaurant':
      return tourismService.getRestaurantByIdV2;
    case 'hotel':
      return tourismService.getHotelByIdV2;
    default:
      return tourismService.getEventByIdV2;
  }
};

const runList = async (
  type: PlaceType,
  filter: string,
  orderBy: string,
  top: number,
  skip: number,
  city: string,
): Promise<Fetched> =>
  (await listFor(type)(
    {
      filter: filter || undefined,
      orderBy: orderBy || undefined,
      skip: skip || undefined,
      top,
    },
    city ? (city as City) : undefined,
  )) as Fetched;

const runById = async (type: PlaceType, id: string) =>
  (await byIdFor(type)(id)) as PlaceRecord | null;

// Primitive arguments only: they are the cache key, for both unstable_cache
// and React cache(). Activities revalidate hourly, the rest every 6 hours.
const cachedList = unstable_cache(runList, ['places:list'], {
  revalidate: SIX_HOURS,
});
const cachedEventList = unstable_cache(runList, ['places:list-events'], {
  revalidate: ONE_HOUR,
});
const cachedById = unstable_cache(runById, ['places:detail'], {
  revalidate: SIX_HOURS,
});
const cachedEventById = unstable_cache(runById, ['places:detail-events'], {
  revalidate: ONE_HOUR,
});

const fetchRecords = cache(
  (
    type: PlaceType,
    filter: string,
    orderBy: string,
    top: number,
    skip: number,
    city: string,
  ): Promise<Fetched> =>
    (type === 'activity' ? cachedEventList : cachedList)(
      type,
      filter,
      orderBy,
      top,
      skip,
      city,
    ),
);

const fetchById = cache((type: PlaceType, id: string) =>
  (type === 'activity' ? cachedEventById : cachedById)(type, id),
);

/** One page of a type's list, newest first; cached server-side. */
export const listPlaces = async (query: PlaceQuery): Promise<PlacePage> => {
  const request = buildListRequest(query);

  if (!request) {
    return { hasMore: false, items: [], page: Math.max(1, query.page ?? 1) };
  }

  const { params } = request;
  const { fetched, items } = await fetchRecords(
    query.type,
    params.filter ?? '',
    params.orderBy ?? '',
    params.top ?? 0,
    params.skip ?? 0,
    request.city ?? '',
  );

  return {
    hasMore: hasMoreRows(fetched, request.pageSize),
    items: items
      .slice(0, request.pageSize)
      .map((record) => toSummary(query.type, record)),
    page: request.page,
  };
};

/** A single record mapped for the detail page, or undefined when missing. */
export const getPlaceDetail = async (
  type: PlaceType,
  id: string,
): Promise<PlaceDetail | undefined> => {
  if (!(isPlaceType(type) && isValidId(id))) {
    return;
  }

  const record = await fetchById(type, id);

  return record ? toDetail(type, record) : undefined;
};

/** Other places of any type in the same town (fallback: same city), nearest first. */
export const getNearbyPlaces = async (
  detail: PlaceDetail,
  limit = DEFAULT_NEARBY,
): Promise<PlaceSummary[]> => {
  if (!isCity(detail.citySlug)) {
    return [];
  }

  const town = detail.town
    ? `PostalAddress/Town eq '${detail.town.replaceAll("'", "''")}'`
    : '';
  const today = taipeiDate(new Date());
  const results = await Promise.all(
    PLACE_TYPES.map(async (type) => {
      const filter =
        type === 'activity'
          ? [town, `EndDateTime ge ${today}`].filter(Boolean).join(' and ')
          : town;
      try {
        const { items } = await fetchRecords(
          type,
          filter,
          orderByFor({ type }),
          NEARBY_FETCH,
          0,
          detail.citySlug,
        );

        return items.map((record) => ({ record, type }));
      } catch (error) {
        // Nearby places are extra; a rate-limited type is just left out.
        console.warn(`[places] nearby ${type} unavailable`, error);
        return [];
      }
    }),
  );
  const origin = detail.position;
  const candidates = results
    .flat()
    .map(({ record, type }) => {
      const point = positionOf(record);

      return {
        distance: origin && point ? distanceKm(origin, point) : undefined,
        summary: toSummary(type, record),
      };
    })
    // Several agencies publish the same place under different IDs, so match
    // on name as well as ID, and keep one record per type and name.
    .filter(
      ({ summary }) =>
        !(
          summary.type === detail.type &&
          (summary.id === detail.id || summary.name === detail.name)
        ),
    )
    .filter(
      ({ summary }, index, all) =>
        all.findIndex(
          (other) =>
            other.summary.type === summary.type &&
            other.summary.name === summary.name,
        ) === index,
    );

  candidates.sort(
    (a, b) =>
      (a.distance ?? Number.POSITIVE_INFINITY) -
      (b.distance ?? Number.POSITIVE_INFINITY),
  );

  return candidates.slice(0, limit).map(({ summary }) => summary);
};

/** Filter options for a type's tag filter (class names from the TDX code tables). */
export const getTagOptions = (type: PlaceType): TagOption[] =>
  isPlaceType(type) ? getTagOptionsFor(type) : [];

/** Keyword search across every type; throws only when every type failed. */
export const searchPlaces = async (
  keyword: string,
  limitPerType = DEFAULT_SEARCH_LIMIT,
): Promise<PlaceSummary[]> => {
  const value = normalizeKeyword(keyword);

  if (!value) {
    return [];
  }

  const results = await Promise.allSettled(
    PLACE_TYPES.map((type) =>
      listPlaces({ keyword: value, page: 1, pageSize: limitPerType, type }),
    ),
  );
  const pages = results.flatMap((result) =>
    result.status === 'fulfilled' ? [result.value] : [],
  );

  // Show whichever types answered; fail only when none did.
  if (pages.length === 0) {
    throw (results[0] as PromiseRejectedResult).reason;
  }

  return pages.flatMap((page) => page.items);
};
